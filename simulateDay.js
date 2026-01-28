const store = require("./store/inMemoryStore");
const Doctor = require("./models/Doctor");
const TimeSlot = require("./models/TimeSlot");
const { allocateToken, cancelToken } = require("./services/allocationService");

// Utility logger
function log(title) {
    console.log("\n============================================================");
    console.log(title);
    console.log("============================================================");
}

// STEP 1: Create Doctors & Slots

log("Creating Doctors and Slots");

function createDoctor(id, name) {
    const doctor = new Doctor(id, name);

    doctor.slots["9-10"] = new TimeSlot("9-10", id, "09:00", "10:00", 2);
    doctor.slots["10-11"] = new TimeSlot("10-11", id, "10:00", "11:00", 2);

    store.doctors[id] = doctor;
}

createDoctor("d1", "Dr. Rao");
createDoctor("d2", "Dr. Mehta");
createDoctor("d3", "Dr. Singh");

console.log("Doctors created:", Object.keys(store.doctors));


// STEP 2: Book Normal Tokens

log("Booking Normal Tokens");

const t1 = allocateToken({
    patientId: "p1",
    doctorId: "d1",
    source: "ONLINE"
});
console.log("Booked:", t1);

const t2 = allocateToken({
    patientId: "p2",
    doctorId: "d1",
    source: "WALK_IN"
});
console.log("Booked:", t2);

// Slot is now FULL (capacity = 2)

const t3 = allocateToken({
    patientId: "p3",
    doctorId: "d1",
    source: "FOLLOW_UP"
});
console.log("Booked (should displace lower priority):", t3);


// STEP 3: Show Slot State

log("Slot State After Initial Bookings");

const slot = store.doctors["d1"].slots["9-10"];
console.log("Confirmed:", slot.confirmedTokens.map(id => store.tokens[id]));
console.log("Waitlist:", slot.waitlistTokens.map(id => store.tokens[id]));


// STEP 4: Cancellation

log("Cancelling a Token");

console.log("Cancelling token:", t3.id);
cancelToken(t3.id);

// Waitlisted token should be promoted
console.log("Confirmed After Cancellation:",
    slot.confirmedTokens.map(id => store.tokens[id])
);
console.log("Waitlist After Cancellation:",
    slot.waitlistTokens.map(id => store.tokens[id])
);


// STEP 5: Emergency Insertion

log("Emergency Patient Arrival");

const emergencyToken = allocateToken({
    patientId: "p999",
    doctorId: "d1",
    source: "EMERGENCY",
    isEmergency: true
});

console.log("Emergency Token Allocated:", emergencyToken);


// STEP 6: Final Slot State

log("Final Slot State");

console.log("Confirmed Tokens:");
slot.confirmedTokens.forEach(id => {
    const t = store.tokens[id];
    console.log(`- ${t.patientId} | ${t.source} | Priority ${t.priority}`);
});

console.log("Waitlist Tokens:");
slot.waitlistTokens.forEach(id => {
    const t = store.tokens[id];
    console.log(`- ${t.patientId} | ${t.source} | Priority ${t.priority}`);
});

log("Simulation Complete");
