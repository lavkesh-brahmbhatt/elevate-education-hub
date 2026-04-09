const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tenantId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  type:      { type: String, enum: ['notice','complaint_resolved',
               'marks_added','attendance_alert','assignment_due'], required: true },
  title:     { type: String, required: true },
  body:      { type: String, required: true },
  link:      String,   // e.g. '/dashboard/notices'
  readAt:    { type: Date, default: null },     // null = unread
}, { timestamps: true });

notificationSchema.index({ userId: 1, readAt: 1 });
notificationSchema.index({ tenantId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
