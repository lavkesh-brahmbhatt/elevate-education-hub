const express = require('express');
const { authenticateJWT, restrictTo } = require('../middleware/authMiddleware');
const identifyTenant = require('../middleware/tenantMiddleware');
const Submission = require('../models/Submission');
const Student = require('../models/Student');

const router = express.Router();

// 1. Submit Assignment (Student only)
router.post('/', authenticateJWT, identifyTenant, restrictTo('STUDENT'), async (req, res) => {
    try {
        const student = await Student.findOne({ email: req.user.email, tenantId: req.tenantId });
        if (!student) return res.status(404).json({ message: 'Student record not found' });
        
        const submission = new Submission({
            ...req.body,
            studentId: student._id,
            tenantId: req.tenantId
        });
        await submission.save();
        res.status(201).json(submission);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 2. Get Submissions for an assignment (Teacher/Admin only)
router.get('/', authenticateJWT, identifyTenant, restrictTo('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { assignmentId } = req.query;
        if (!assignmentId) return res.status(400).json({ message: 'Assignment ID required' });
        
        const submissions = await Submission.find({ assignmentId, tenantId: req.tenantId })
            .populate('studentId', 'name rollNumber classId')
            .sort({ submittedAt: -1 });
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Mark/Grade Submission (Teacher/Admin)
router.put('/:id/grade', authenticateJWT, identifyTenant, restrictTo('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const submission = await Submission.findOneAndUpdate(
            { _id: req.params.id, tenantId: req.tenantId },
            { 
              grade: req.body.grade, 
              feedback: req.body.feedback,
              status: 'graded'
            },
            { new: true }
        );
        if (!submission) return res.status(404).json({ message: 'Submission not found' });
        res.json(submission);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 4. Get My Submission for an assignment (Student)
router.get('/my', authenticateJWT, identifyTenant, restrictTo('STUDENT'), async (req, res) => {
    try {
        const { assignmentId } = req.query;
        const student = await Student.findOne({ email: req.user.email, tenantId: req.tenantId });
        if (!student) return res.status(404).json({ message: 'Student record not found' });
        
        const submission = await Submission.findOne({ 
            assignmentId, 
            studentId: student._id, 
            tenantId: req.tenantId 
        });
        res.json(submission || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
