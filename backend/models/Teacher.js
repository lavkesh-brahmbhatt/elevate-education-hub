const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, { timestamps: true });

// Ensure unique email per school
teacherSchema.index({ email: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model('Teacher', teacherSchema);
// Assuming the user intended to add the Student model as well,
// and the module.exports for Teacher should remain.
// If the user intended to export Student, this line would need to change.
// For now, keeping the original export for Teacher and adding Student schema.
// module.exports = mongoose.model('Student', studentSchema); // This would be if Student was the primary export.
