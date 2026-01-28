class TimeSlot {
    constructor(id, doctorId, startTime, endTime, maxCapacity, overbookLimit = 2) {
        this.id = id;
        this.doctorId = doctorId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.maxCapacity = maxCapacity;
        this.overbookLimit = overbookLimit;

        this.confirmedTokens = [];
        this.waitlistTokens = [];
    }
}

module.exports = TimeSlot;
