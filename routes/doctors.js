const express = require("express");
const Doctor = require("../models/Doctor");
const TimeSlot = require("../models/TimeSlot");
const store = require("../store/inMemoryStore");

const router = express.Router();

// Create doctor with slots
router.post("/", (req, res) => {
    const { id, name, slots } = req.body;

    const doctor = new Doctor(id, name);

    slots.forEach(slot => {
        doctor.slots[slot.id] = new TimeSlot(
            slot.id,
            id,
            slot.startTime,
            slot.endTime,
            slot.maxCapacity
        );
    });

    store.doctors[id] = doctor;
    res.json({ message: "Doctor created", doctor });
});

// View schedule
router.get("/:id/schedule", (req, res) => {
    const doctor = store.doctors[req.params.id];
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    res.json(doctor.slots);
});

module.exports = router;
