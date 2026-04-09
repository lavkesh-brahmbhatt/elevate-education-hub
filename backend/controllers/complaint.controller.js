const Complaint = require('../models/Complaint');

exports.createComplaint = async (req, res) => {
    try {
        const { subject, message } = req.body;
        const tenantId = req.tenantId;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const complaint = new Complaint({
            userId,
            userRole,
            subject,
            message,
            status: "Pending",
            tenantId
        });

        await complaint.save();

        const Activity = require('../models/Activity');
        await Activity.create({
            tenantId: req.tenantId,
            action: 'COMPLAINT_FILED',
            details: `New complaint: "${subject}"`,
            performedBy: req.user?.email || 'unknown'
        });

        res.status(201).json(complaint);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getComplaints = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const role = req.user.role;
        const userId = req.user.userId;

        let query = { tenantId };

        // Admin and Teacher see ALL complaints in their tenant
        // Student and Parent see ONLY their own
        if (role === 'STUDENT' || role === 'PARENT') {
            query.userId = userId;
        }

        const complaints = await Complaint.find(query).populate('userId', 'email').sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.resolveComplaint = async (req, res) => {
    try {
        const { response } = req.body;
        const complaint = await Complaint.findOneAndUpdate(
            { _id: req.params.id, tenantId: req.tenantId },
            { status: 'Resolved', response },
            { new: true }
        );
        
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        
        const { createNotification } = require('../services/notificationService');
        await createNotification({
            userId: complaint.userId,
            tenantId: req.tenantId,
            type: 'complaint_resolved',
            title: 'Complaint Resolved',
            body: `Your complaint about "${complaint.subject}" has been resolved.`,
            link: '/dashboard/complaints'
        });

        res.json(complaint);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
