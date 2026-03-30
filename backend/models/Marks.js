const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  marksObtained: { type: Number, required: true },
  maxMarks: { type: Number, default: 100 },
  examType: { type: String, enum: ['Midterm', 'Final', 'Quiz', 'Assignment', 'Unit Test'], required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Marks', marksSchema);
