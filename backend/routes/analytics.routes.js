const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { restrictTo } = require('../middleware/authMiddleware');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Notice = require('../models/Notice');
const Parent = require('../models/Parent');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Assignment = require('../models/Assignment');
const Activity = require('../models/Activity');

// --- ADMIN STATS ---
router.get('/stats', restrictTo('ADMIN'), async (req, res) => {
    try {
        const [studentCount, teacherCount, classCount, noticeCount] = await Promise.all([
            Student.countDocuments({ tenantId: req.tenantId }),
            Teacher.countDocuments({ tenantId: req.tenantId }),
            Class.countDocuments({ tenantId: req.tenantId }),
            Notice.countDocuments({ tenantId: req.tenantId })
        ]);
        const studentsPerClass = await Student.aggregate([
            { $match: { tenantId: req.tenantId } },
            { $group: { _id: '$classId', count: { $sum: 1 } } },
            { $lookup: { from: 'classes', localField: '_id', foreignField: '_id', as: 'classDetails' } },
            { $unwind: '$classDetails' },
            { $project: { name: '$classDetails.name', count: 1 } }
        ]);
        res.json({ stats: { studentCount, teacherCount, classCount, noticeCount }, chartData: studentsPerClass });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- RECENT ACTIVITY ---
router.get('/activity', restrictTo('ADMIN'), async (req, res) => {
    try {
        const activities = await Activity.find({ tenantId: req.tenantId }).sort({ createdAt: -1 }).limit(5);
        res.json(activities);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- PARENT STATS ---
router.get('/parent', restrictTo('PARENT'), async (req, res) => {
    try {
        const parent = await Parent.findOne({ email: req.user.email, tenantId: req.tenantId });
        if (!parent || !parent.studentId) return res.json({ stats: null });

        const studentId = parent.studentId;
        const student = await Student.findById(studentId);

        const [attendance, latestMark, noticeCount, assignmentCount] = await Promise.all([
            Attendance.find({ studentId, tenantId: req.tenantId }),
            Marks.findOne({ studentId, tenantId: req.tenantId }).sort({ createdAt: -1 }).populate('subjectId', 'name'),
            Notice.countDocuments({ tenantId: req.tenantId }),
            student ? Assignment.countDocuments({ classId: student.classId, tenantId: req.tenantId }) : 0
        ]);

        const presentCount = attendance.filter(a => a.status === 'present').length;
        const attendanceRate = attendance.length > 0 ? (presentCount / attendance.length * 100).toFixed(0) : '0';

        res.json({
            stats: {
                attendanceRate: `${attendanceRate}%`,
                latestMark: latestMark ? `${latestMark.marksObtained}/${latestMark.maxMarks} (${latestMark.subjectId?.name || 'N/A'})` : 'N/A',
                noticeCount,
                assignmentCount
            }
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- EXISTING DETAILED ANALYTICS (Admin Only) ---
router.get('/class-performance', restrictTo('ADMIN'), analyticsController.getClassPerformance);
router.get('/top-students', restrictTo('ADMIN'), analyticsController.getTopStudents);
router.get('/subject-performance', restrictTo('ADMIN'), analyticsController.getSubjectPerformance);
router.get('/pass-fail', restrictTo('ADMIN'), analyticsController.getPassFailStats);
router.get('/summary', restrictTo('ADMIN'), analyticsController.getSummaryStats);

module.exports = router;
