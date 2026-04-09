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
            const student = await Student.findOne({ email: req.user.email, tenantId: req.tenantId });
            if (student) query.studentId = student._id;
            else return res.status(404).json({ message: 'Student record not found' });
        } else if (req.user.role === 'PARENT') {
            const Parent = require('../models/Parent');
            const parent = await Parent.findOne({ email: req.user.email, tenantId: req.tenantId });
            if (parent && parent.studentId) query.studentId = parent.studentId;
            else return res.status(404).json({ message: 'No student linked to this parent' });
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

        const operations = records.map(r => ({
            updateOne: {
                filter: { 
                    studentId: r.studentId, 
                    subjectId: r.subjectId, 
                    examType: r.examType, 
                    tenantId: req.tenantId 
                },
                update: { $set: { ...r, tenantId: req.tenantId } },
                upsert: true
            }
        }));

        const result = await Marks.bulkWrite(operations);
        
        // Notify students
        const { createNotification } = require('../services/notificationService');
        const User = require('../models/User');
        const Student = require('../models/Student');
        
        for (const r of records) {
            const student = await Student.findById(r.studentId);
            if (student) {
                const user = await User.findOne({ email: student.email, tenantId: req.tenantId });
                if (user) {
                    await createNotification({
                        userId: user._id,
                        tenantId: req.tenantId,
                        type: 'marks_added',
                        title: 'New Marks Added',
                        body: `New marks have been posted for your ${r.examType} exam. Check your results now.`,
                        link: '/dashboard/my-marks'
                    });
                }
            }
        }

        res.status(200).json({ message: "Marks recorded successfully", result });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }

});

module.exports = router;
