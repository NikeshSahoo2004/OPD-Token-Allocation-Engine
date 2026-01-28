const store = require("../store/inMemoryStore");
const Token = require("../models/Token");

// simple counter to guarantee unique token IDs
let tokenCounter = 1;


// Sort token IDs by priority, then by booking time

function sortByPriorityAndTime(tokenIds) {
    return tokenIds.sort((a, b) => {
        const t1 = store.tokens[a];
        const t2 = store.tokens[b];

        if (t1.priority !== t2.priority) {
            return t1.priority - t2.priority; // lower = higher priority
        }
        return t1.createdAt - t2.createdAt;
    });
}

// Allocate a token for a patient

function allocateToken({ patientId, doctorId, source, isEmergency = false }) {
    const doctor = store.doctors[doctorId];
    if (!doctor) throw new Error("Doctor not found");

    const priority = store.priorityMap[source];
    const tokenId = `token_${tokenCounter++}`;

    // iterate through doctor's slots (earliest first)
    for (const slotId in doctor.slots) {
        const slot = doctor.slots[slotId];

        const confirmedCount = slot.confirmedTokens.length;
        const capacityLimit =
            slot.maxCapacity + (isEmergency ? slot.overbookLimit : 0);


        // CASE 1: Slot has free capacity

        if (confirmedCount < capacityLimit) {
            const token = new Token(
                tokenId,
                patientId,
                doctorId,
                slotId,
                source,
                priority
            );

            store.tokens[tokenId] = token;
            slot.confirmedTokens.push(tokenId);
            return token;
        }


        // CASE 2: Slot full ==> try priority-based displacement

        let lowestTokenId = null;
        let highestPriorityValue = -1;

        // find lowest-priority confirmed token

        slot.confirmedTokens.forEach(id => {
            const t = store.tokens[id];
            if (t.priority > highestPriorityValue) {
                highestPriorityValue = t.priority;
                lowestTokenId = id;
            }
        });

        if (lowestTokenId) {
            const lowestToken = store.tokens[lowestTokenId];

            // displace only if incoming has higher priority OR emergency
            if (priority < lowestToken.priority || isEmergency) {
                // demote existing token
                lowestToken.status = "WAITLISTED";
                slot.confirmedTokens = slot.confirmedTokens.filter(
                    id => id !== lowestTokenId
                );
                slot.waitlistTokens.push(lowestTokenId);

                // confirm new token
                const token = new Token(
                    tokenId,
                    patientId,
                    doctorId,
                    slotId,
                    source,
                    priority
                );

                store.tokens[tokenId] = token;
                slot.confirmedTokens.push(tokenId);
                return token;
            }
        }
    }

    throw new Error("No slots available");
}


//Cancel an existing token and reallocate from waitlist

function cancelToken(tokenId) {
    const token = store.tokens[tokenId];
    if (!token || token.status !== "CONFIRMED") {
        throw new Error("Invalid token");
    }

    const doctor = store.doctors[token.doctorId];
    const slot = doctor.slots[token.slotId];

    // cancel token

    token.status = "CANCELLED";
    slot.confirmedTokens = slot.confirmedTokens.filter(id => id !== tokenId);

    // promote from waitlist if available

    if (slot.waitlistTokens.length > 0) {
        sortByPriorityAndTime(slot.waitlistTokens);
        const promotedId = slot.waitlistTokens.shift();

        store.tokens[promotedId].status = "CONFIRMED";
        slot.confirmedTokens.push(promotedId);
    }
}

module.exports = {
    allocateToken,
    cancelToken
};
