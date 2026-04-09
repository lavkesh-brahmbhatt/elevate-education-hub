const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true }, 
  role: { type: String, enum: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'], default: 'ADMIN' },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  refreshToken: String
}, { timestamps: true });

// Ensure unique email per school
userSchema.index({ email: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
