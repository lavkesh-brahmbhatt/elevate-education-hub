const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['event', 'update', 'alert'], 
    default: 'update' 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['ADMIN', 'TEACHER'], required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
