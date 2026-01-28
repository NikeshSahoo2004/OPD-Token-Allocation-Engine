class Token {
    constructor(id, patientId, doctorId, slotId, source, priority) {
        this.id = id;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.slotId = slotId;
        this.source = source;
        this.priority = priority;

        this.status = "CONFIRMED";
        this.createdAt = Date.now();
    }
}

module.exports = Token;
