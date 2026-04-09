const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  tenantId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  content:      String,       // Text submission
  fileUrl:      String,       // File submission URL
  submittedAt:  { type: Date, default: Date.now },
  status:       { type: String, enum: ['submitted','graded','late'], default:'submitted' },
  grade:        String,       // e.g. 'A', 'B+', or percentage
  feedback:     String        // Teacher's comment
}, { timestamps: true });

submissionSchema.index({ tenantId: 1, assignmentId: 1 });
submissionSchema.index({ tenantId: 1, studentId: 1, assignmentId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
