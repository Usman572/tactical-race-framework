const Notification = require('../models/Notification');
const socketManager = require('../socket');

const createNotification = async ({ recipient, sender, race, joinRequest, type, message, mediaUrl }) => {
    try {
        const notificationData = {
            recipient,
            sender,
            message,
            mediaUrl,
            type
        };

        if (race && race !== "") notificationData.race = race;
        if (joinRequest && joinRequest !== "") notificationData.joinRequest = joinRequest;

        const notification = await Notification.create(notificationData);

        // Emit real-time notification
        try {
            const io = socketManager.getIO();
            const populatedNotification = await Notification.findById(notification._id)
                .populate('sender', 'name profilePicture')
                .populate('race', 'name location')
                .populate('joinRequest');

            io.to(recipient.toString()).emit('new_notification', populatedNotification);
        } catch (socketErr) {
            console.error('Socket emit failed, but notification was saved:', socketErr.message);
        }

        return notification;
    } catch (err) {
        console.error('Error creating notification utility:', err);
        throw err;
    }
};

module.exports = { createNotification };
