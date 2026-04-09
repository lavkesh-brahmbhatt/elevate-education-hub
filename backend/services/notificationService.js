const Notification = require('../models/Notification');
const User = require('../models/User');

exports.createNotification = async ({ userId, tenantId, type, title, body, link }) => {
    try {
        const notification = new Notification({ userId, tenantId, type, title, body, link });
        await notification.save();
        
        // Email Alert if configured
        const user = await User.findById(userId);
        if (user && user.email) {
            const { sendEmail } = require('./emailService');
            await sendEmail({
                to: user.email,
                subject: `Academy OS: ${title}`,
                text: `${body}\n\nView details at: ${process.env.APP_URL}${link || '/dashboard'}`
            });
        }

        return notification;
    } catch (err) {

        console.error('Notification creation failed:', err.message);
    }
};

exports.notifyAll = async (tenantId, { type, title, body, link }) => {
    try {
        const users = await User.find({ tenantId });
        const notifications = users.map(user => ({
            userId: user._id,
            tenantId,
            type,
            title,
            body,
            link
        }));
        await Notification.insertMany(notifications);
    } catch (err) {
        console.error('Bulk notification failed:', err.message);
    }
};
