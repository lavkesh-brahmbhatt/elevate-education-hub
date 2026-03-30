const Notice = require('../models/Notice');

exports.createNotice = async (req, res) => {
    try {
        const { title, description, category } = req.body;
        const tenantId = req.tenantId;
        const userId = req.user.userId;
        const role = req.user.role;

        const notice = new Notice({
            title,
            description,
            category: category || 'update',
            createdBy: userId,
            role,
            tenantId
        });

        await notice.save();
        
        const Activity = require('../models/Activity');
        await Activity.create({
            tenantId,
            action: 'NOTICE_POSTED',
            details: `Posted notice: "${title}"`,
            performedBy: req.user?.email || 'admin'
        });

        res.status(201).json(notice);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getNotices = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const notices = await Notice.find({ tenantId }).sort({ createdAt: -1 });
        res.json(notices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteNotice = async (req, res) => {
    try {
        // Only Admin or Teacher of this tenant can delete
        const notice = await Notice.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
        if (!notice) return res.status(404).json({ message: 'Notice not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
