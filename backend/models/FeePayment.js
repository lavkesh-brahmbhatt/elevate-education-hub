const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  tenantId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  amount:    { type: Number, required: true },
  dueDate:   { type: String, required: true },
  paidDate:  { type: String },
  status:    { type: String, enum: ['Pending','Paid','Overdue'], default: 'Pending' },
  description: String,  // e.g. "Term 1 Tuition Fee"
  receiptNo: String
}, { timestamps: true });

feePaymentSchema.index({ tenantId: 1, studentId: 1 });
feePaymentSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model('FeePayment', feePaymentSchema);
