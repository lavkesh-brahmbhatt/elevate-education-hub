const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    tenantId: { type: String, required: true },
    action: { type: String, required: true }, // e.g., 'STUDENT_CREATED', 'NOTICE_POSTED'
    details: { type: String },
    performedBy: { type: String }, // User email or ID
}, { timestamps: true });

module.exports = mongoose.model('Activity', ActivitySchema);
