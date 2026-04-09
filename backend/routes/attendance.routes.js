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
            const s = await Student.findOne({ email: req.user.email, tenantId: req.tenantId });
            if (s) query.studentId = s._id;
            else return res.status(404).json({ message: 'Student profile not found' });
        } else if (req.user.role === 'PARENT') {
            const Parent = require('../models/Parent');
            const parent = await Parent.findOne({ email: req.user.email, tenantId: req.tenantId });
            if (parent && parent.studentId) query.studentId = parent.studentId;
            else return res.status(404).json({ message: 'No student linked to this parent' });
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
        
        // Notify parents if attendance drops below 75%
        const { createNotification } = require('../services/notificationService');
        const Parent = require('../models/Parent');
        const User = require('../models/User');
        const Student = require('../models/Student');

        for (const r of records) {
            // Calculate total for this student
            const allRecords = await Attendance.find({ studentId: r.studentId, tenantId: req.tenantId });
            const present = allRecords.filter(rec => rec.status === 'present').length;
            const percentage = (present / allRecords.length) * 100;

            if (percentage < 75 && allRecords.length >= 5) { // Minimum 5 records to alert
                const student = await Student.findById(r.studentId);
                const parent = await Parent.findOne({ studentId: r.studentId, tenantId: req.tenantId });
                if (parent) {
                    const parentUser = await User.findOne({ email: parent.email, tenantId: req.tenantId });
                    if (parentUser) {
                        await createNotification({
                            userId: parentUser._id,
                            tenantId: req.tenantId,
                            type: 'attendance_alert',
                            title: 'Low Attendance Alert',
                            body: `${student?.name}'s attendance has dropped to ${Math.round(percentage)}%. Please contact the school.`,
                            link: '/dashboard/child-attendance'
                        });
                    }
                }
            }
        }

        res.json({ message: "Attendance updated", result });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
