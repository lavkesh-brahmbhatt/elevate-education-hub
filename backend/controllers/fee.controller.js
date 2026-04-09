const FeePayment = require('../models/FeePayment');
const Student = require('../models/Student');

exports.getFees = async (req, res) => {
  try {
    const query = { tenantId: req.tenantId };
    
    // If student/parent: only their own (or linked student)
    if (req.user.role === 'STUDENT') {
      const student = await Student.findOne({ email: req.user.email, tenantId: req.tenantId });
      if (student) query.studentId = student._id;
      else return res.json([]);
    } else if (req.user.role === 'PARENT') {
      // Find linked students for parent email
      const Parent = require('../models/Parent');
      const parent = await Parent.findOne({ email: req.user.email, tenantId: req.tenantId });
      if (parent) query.studentId = parent.studentId;
      else return res.json([]);
    }

    const fees = await FeePayment.find(query)
      .populate('studentId', 'name rollNumber classId')
      .sort({ createdAt: -1 });
    res.json(fees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createFee = async (req, res) => {
  try {
    const fee = new FeePayment({
      ...req.body,
      tenantId: req.tenantId
    });
    await fee.save();
    
    // Notify Student and parent
    const { createNotification } = require('../services/notificationService');
    const User = require('../models/User');
    const student = await Student.findById(req.body.studentId);
    if (student) {
        // Notify Student
        const studentUser = await User.findOne({ email: student.email, tenantId: req.tenantId });
        if (studentUser) {
            await createNotification({
                userId: studentUser._id,
                tenantId: req.tenantId,
                type: 'notice',
                title: 'New Fee Invoice Issued',
                body: `An invoice of ₹${req.body.amount} for "${req.body.description}" is due on ${req.body.dueDate}.`,
                link: '/dashboard/my-fees'
            });
        }
        
        // Notify Parent
        const Parent = require('../models/Parent');
        const parent = await Parent.findOne({ studentId: student._id, tenantId: req.tenantId });
        if (parent) {
            const parentUser = await User.findOne({ email: parent.email, tenantId: req.tenantId });
            if (parentUser) {
                await createNotification({
                    userId: parentUser._id,
                    tenantId: req.tenantId,
                    type: 'notice',
                    title: 'New Student Fee Invoice',
                    body: `A new fee invoice for ${student.name} of ₹${req.body.amount} has been issued.`,
                    link: '/dashboard/child-fees'
                });
            }
        }
    }

    res.status(201).json(fee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateFee = async (req, res) => {
  try {
    const fee = await FeePayment.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true }
    );
    if (!fee) return res.status(404).json({ message: 'Fee record not found' });
    res.json(fee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getFeeSummary = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const stats = await FeePayment.aggregate([
      { $match: { tenantId: tenantId } },
      { $group: {
          _id: "$status",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
      }}
    ]);
    
    const summary = {
      Paid: { total: 0, count: 0 },
      Pending: { total: 0, count: 0 },
      Overdue: { total: 0, count: 0 }
    };
    
    stats.forEach(s => {
      if (summary[s._id]) {
        summary[s._id] = { total: s.total, count: s.count };
      }
    });

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
