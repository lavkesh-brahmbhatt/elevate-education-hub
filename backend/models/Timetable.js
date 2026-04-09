const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  classId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  tenantId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  day:       { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], required: true },
  slots: [{
    startTime: { type: String, required: true }, // Format HH:mm
    endTime:   { type: String, required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    roomNo:    String
  }]
}, { timestamps: true });

timetableSchema.index({ tenantId: 1, classId: 1, day: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
