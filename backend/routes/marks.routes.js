const express = require('express');
const router = express.Router();
const Marks = require('../models/Marks');
const { authenticateJWT, restrictTo } = require('../middleware/authMiddleware');
const identifyTenant = require('../middleware/tenantMiddleware');

// Get marks (for students/teachers)
router.get('/', authenticateJWT, identifyTenant, async (req, res) => {
    try {
        let query = { tenantId: req.tenantId };
        
        // If student or parent, filter marks
        if (req.user.role === 'STUDENT') {
            const Student = require('../models/Student');
            const student = await Student.findOne({ email: req.user.email });
            if (student) query.studentId = student._id;
            else return res.status(404).json({ message: 'Student record not found' });
        } else if (req.user.role === 'PARENT') {
            // For now, parents see all marks in tenant or we'd need a Student-Parent link
            // As a shim, we'll just allow them to see marks for now or add a studentId query param
            if (req.query.studentId) query.studentId = req.query.studentId;
        }
        
        const marks = await Marks.find(query)
            .populate('studentId', 'name rollNumber')
            .populate('subjectId', 'name')
            .populate('classId', 'name section');
        res.json(marks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bulk Insert/Upsert Marks (for Teachers)
router.post('/bulk', authenticateJWT, identifyTenant, restrictTo('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { records } = req.body; // Expect array of formatted mark objects
        if (!records || !Array.isArray(records)) return res.status(400).json({ message: "Invalid records format" });

        const formattedRecords = records.map(r => ({
            ...r,
            tenantId: req.tenantId
        }));

        // Simple bulk insert for now, can be improved to upsert
        const result = await Marks.insertMany(formattedRecords);
        res.status(201).json({ message: "Marks recorded successfully", count: result.length });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
