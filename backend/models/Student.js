const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  rollNumber: { type: String, required: true }
}, { timestamps: true });

// Prevent same roll number in the SAME school
studentSchema.index({ tenantId: 1, rollNumber: 1 }, { unique: true });

module.exports = mongoose.model('Student', studentSchema);
