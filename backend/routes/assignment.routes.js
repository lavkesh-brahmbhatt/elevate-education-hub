const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const { authenticateJWT, restrictTo } = require('../middleware/authMiddleware');
const identifyTenant = require('../middleware/tenantMiddleware');

// Get all assignments (filtered by role)
router.get('/', authenticateJWT, identifyTenant, async (req, res) => {
    try {
        let query = { tenantId: req.tenantId };
        
        if (req.user.role === 'TEACHER') {
            const Teacher = require('../models/Teacher');
            const t = await Teacher.findOne({ email: req.user.email, tenantId: req.tenantId });
            if (t) query.teacherId = t._id;
        } else if (req.user.role === 'STUDENT') {
            const Student = require('../models/Student');
            const s = await Student.findOne({ email: req.user.email, tenantId: req.tenantId });
            if (s && s.classId) query.classId = s.classId;
            else return res.json([]); // No class assigned
        } else if (req.user.role === 'PARENT') {
            const Parent = require('../models/Parent');
            const Student = require('../models/Student');
            const parent = await Parent.findOne({ email: req.user.email, tenantId: req.tenantId });
            if (parent && parent.studentId) {
                const student = await Student.findById(parent.studentId);
                if (student && student.classId) query.classId = student.classId;
                else return res.json([]);
            } else return res.json([]);
        }

        const data = await Assignment.find(query)
            .populate('classId', 'name section')
            .populate('subjectId', 'name')
            .populate('teacherId', 'name');
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create assignment (Teacher/Admin)
router.post('/', authenticateJWT, identifyTenant, restrictTo('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const assignment = new Assignment({
            ...req.body,
            tenantId: req.tenantId
        });
        await assignment.save();
        res.status(201).json(assignment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete assignment
router.delete('/:id', authenticateJWT, identifyTenant, restrictTo('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        await Assignment.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
        res.json({ message: 'Assignment deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
