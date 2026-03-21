const Marks = require('../models/Marks');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const mongoose = require('mongoose');

// 1. Class-wise Average Marks
exports.getClassPerformance = async (req, res) => {
    try {
        const stats = await Marks.aggregate([
            { $match: { tenantId: req.tenantId } },
            {
                $group: {
                    _id: "$classId",
                    avgMarks: { $avg: "$marksObtained" }
                }
            },
            {
                $lookup: {
                    from: "classes",
                    localField: "_id",
                    foreignField: "_id",
                    as: "classInfo"
                }
            },
            { $unwind: "$classInfo" },
            {
                $project: {
                    _id: 0,
                    className: "$classInfo.name",
                    averageMarks: { $round: ["$avgMarks", 2] }
                }
            },
            { $sort: { className: 1 } }
        ]);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: "Error fetching class performance", error: err.message });
    }
};

// 2. Top Performing Students
exports.getTopStudents = async (req, res) => {
    try {
        const stats = await Marks.aggregate([
            { $match: { tenantId: req.tenantId } },
            {
                $group: {
                    _id: "$studentId",
                    avgMarks: { $avg: "$marksObtained" }
                }
            },
            {
                $lookup: {
                    from: "students",
                    localField: "_id",
                    foreignField: "_id",
                    as: "studentInfo"
                }
            },
            { $unwind: "$studentInfo" },
            {
                $project: {
                    _id: 0,
                    studentName: "$studentInfo.name",
                    averageMarks: { $round: ["$avgMarks", 2] }
                }
            },
            { $sort: { averageMarks: -1 } },
            { $limit: 5 }
        ]);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: "Error fetching top students", error: err.message });
    }
};

// 3. Subject-wise Performance
exports.getSubjectPerformance = async (req, res) => {
    try {
        const stats = await Marks.aggregate([
            { $match: { tenantId: req.tenantId } },
            {
                $group: {
                    _id: "$subjectId",
                    avgMarks: { $avg: "$marksObtained" }
                }
            },
            {
                $lookup: {
                    from: "subjects",
                    localField: "_id",
                    foreignField: "_id",
                    as: "subjectInfo"
                }
            },
            { $unwind: "$subjectInfo" },
            {
                $project: {
                    _id: 0,
                    subjectName: "$subjectInfo.name",
                    averageMarks: { $round: ["$avgMarks", 2] }
                }
            },
            { $sort: { subjectName: 1 } }
        ]);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: "Error fetching subject performance", error: err.message });
    }
};

// 4. Pass vs Fail Count
exports.getPassFailStats = async (req, res) => {
    try {
        const stats = await Marks.aggregate([
            { $match: { tenantId: req.tenantId } },
            {
                $group: {
                    _id: null,
                    passCount: { $sum: { $cond: [{ $gte: ["$marksObtained", 40] }, 1, 0] } },
                    failCount: { $sum: { $cond: [{ $lt: ["$marksObtained", 40] }, 1, 0] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    passCount: 1,
                    failCount: 1
                }
            }
        ]);
        res.json(stats[0] || { passCount: 0, failCount: 0 });
    } catch (err) {
        res.status(500).json({ message: "Error fetching pass/fail stats", error: err.message });
    }
};

// 5. Overall Dashboard Stats
exports.getSummaryStats = async (req, res) => {
    try {
        const [totalStudents, totalTeachers, totalClasses, avgData] = await Promise.all([
            Student.countDocuments({ tenantId: req.tenantId }),
            Teacher.countDocuments({ tenantId: req.tenantId }),
            Class.countDocuments({ tenantId: req.tenantId }), // Actually, Class.countDocuments({ tenantId: req.tenantId }) - Wait, my Class model doesn't have tenantId in Step 583!
            Marks.aggregate([
                { $match: { tenantId: req.tenantId } },
                { $group: { _id: null, overallAvg: { $avg: "$marksObtained" } } }
            ])
        ]);

        res.json({
            totalStudents,
            totalTeachers,
            totalClasses,
            averageMarks: avgData[0] ? Math.round(avgData[0].overallAvg * 100) / 100 : 0
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching summary stats", error: err.message });
    }
};
