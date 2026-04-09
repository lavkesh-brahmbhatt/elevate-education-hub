const express = require('express');
const { authenticateJWT, restrictTo } = require('../middleware/authMiddleware');
const identifyTenant = require('../middleware/tenantMiddleware');
const Timetable = require('../models/Timetable');

const router = express.Router();

// GET timetable for a class
router.get('/:classId', authenticateJWT, identifyTenant, async (req, res) => {
    try {
        const timetable = await Timetable.find({ 
            classId: req.params.classId, 
            tenantId: req.tenantId 
        }).populate('slots.subjectId slots.teacherId');
        res.json(timetable);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPSERT timetable for a class/day (Admin only)
router.post('/', authenticateJWT, identifyTenant, restrictTo('ADMIN'), async (req, res) => {
    try {
        const { classId, day, slots } = req.body;
        const timetable = await Timetable.findOneAndUpdate(
            { classId, day, tenantId: req.tenantId },
            { slots },
            { upsert: true, new: true }
        );
        res.json(timetable);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
