const express = require('express');
const { authenticateJWT } = require('../middleware/authMiddleware');
const identifyTenant = require('../middleware/tenantMiddleware');
const Notification = require('../models/Notification');

const router = express.Router();

// GET user's notifications (last 20)
router.get('/', authenticateJWT, identifyTenant, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.userId, tenantId: req.tenantId })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT mark all as read
router.put('/read', authenticateJWT, identifyTenant, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.userId, tenantId: req.tenantId, readAt: null },
            { readAt: new Date() }
        );
        res.json({ message: 'Notifications marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
