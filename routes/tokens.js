const express = require("express");
const { allocateToken, cancelToken } = require("../services/allocationService");

const router = express.Router();

// Book token
router.post("/book", (req, res) => {
    try {
        const token = allocateToken(req.body);
        res.json(token);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Emergency token
router.post("/emergency", (req, res) => {
    try {
        const token = allocateToken({ ...req.body, source: "EMERGENCY", isEmergency: true });
        res.json(token);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Cancel token
router.post("/cancel", (req, res) => {
    try {
        cancelToken(req.body.tokenId);
        res.json({ message: "Token cancelled" });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

module.exports = router;
