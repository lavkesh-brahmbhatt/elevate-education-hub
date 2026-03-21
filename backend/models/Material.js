const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uploadedBy: { type: String, required: true }, // Name or User ID
  role: { type: String, enum: ['ADMIN', 'TEACHER'], required: true },
  className: { type: String },
  subject: { type: String },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);
