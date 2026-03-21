const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { authenticateJWT, restrictTo } = require('../middleware/authMiddleware');
const identifyTenant = require('../middleware/tenantMiddleware');

// List attendance with filters
router.get('/', authenticateJWT, identifyTenant, async (req, res) => {
    try {
        const { date, classId } = req.query;
        let query = { tenantId: req.tenantId };
        if (date) query.date = date;
        if (classId) query.classId = classId;

        // Extra check for student
        if (req.user.role === 'STUDENT') {
            const Student = require('../models/Student');
            const s = await Student.findOne({ email: req.user.email });
            if (s) query.studentId = s._id;
            else return res.status(404).json({ message: 'Student profile not found' });
        }

        const data = await Attendance.find(query).populate('studentId', 'name rollNumber');
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bulk upsert attendance (for teachers)
router.post('/bulk', authenticateJWT, identifyTenant, restrictTo('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { records } = req.body; // Array: [{ studentId, classId, date, status }]
        if (!records?.length) return res.status(400).json({ message: "No records provided" });

        const operations = records.map(r => ({
            updateOne: {
                filter: { studentId: r.studentId, date: r.date, tenantId: req.tenantId },
                update: { ...r, markedBy: req.user.userId, tenantId: req.tenantId },
                upsert: true
            }
        }));

        const result = await Attendance.bulkWrite(operations);
        res.json({ message: "Attendance updated", result });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
