const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  rollNumber: { type: String, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  age: { type: Number, required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, { timestamps: true });

studentSchema.index({ email: 1, tenantId: 1 }, { unique: true });
studentSchema.index({ rollNumber: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model('Student', studentSchema);
