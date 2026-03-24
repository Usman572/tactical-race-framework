const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            $or: [{ recipient: req.user._id }, { sender: req.user._id }]
        })
            .populate('sender', 'name profilePicture rank')
            .populate('recipient', 'name profilePicture rank')
            .populate('race', 'name location')
            .populate('joinRequest')
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        res.json(notification);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const sendNotification = async (req, res) => {
    try {
        const { recipient, message, raceId } = req.body;
        
        // Validation: Required recipient, and either message OR file
        if (!recipient || (!message && !req.file)) {
            return res.status(400).json({ message: 'Recipient and content (message or media) are required' });
        }

        let mediaUrl = null;
        let type = 'Message';

        if (req.file) {
            mediaUrl = `/uploads/${req.file.filename}`;
            const mime = req.file.mimetype;
            if (mime.startsWith('image/')) type = 'Image';
            else if (mime.startsWith('video/')) type = 'Video';
            else if (mime.startsWith('audio/')) type = 'Audio';
        }

        const { createNotification } = require('../utils/notification');
        const notification = await createNotification({
            recipient,
            sender: req.user._id,
            race: (raceId && raceId !== 'undefined' && raceId !== '') ? raceId : undefined,
            message: message || `Sent a ${type.toLowerCase()}`,
            mediaUrl,
            type
        });

        // Update stats and check achievements
        const User = require('../models/User');
        const sender = await User.findById(req.user._id);
        if (sender) {
            sender.stats.messagesSent += 1;
            sender.stats.points += 1; // +1 XP per message
            const { checkAchievements } = require('../utils/gamification');
            await checkAchievements(sender, 'MESSAGE');
            await sender.save();
        }

        res.status(201).json(notification);
    } catch (err) {
        console.error("sendNotification error:", err);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });

        // Authorization: Either the sender or the recipient can delete the message record
        const isRecipient = notification.recipient.toString() === req.user._id.toString();
        const isSender = notification.sender.toString() === req.user._id.toString();

        if (!isRecipient && !isSender) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Notification.findByIdAndDelete(req.params.id);
        res.json({ message: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteThread = async (req, res) => {
    try {
        const { senderId } = req.params; // This is the ID of the "other" person in the conversation
        // Delete all communications between the requester and the senderId (both ways)
        await Notification.deleteMany({
            $or: [
                { recipient: req.user._id, sender: senderId },
                { recipient: senderId, sender: req.user._id }
            ]
        });
        res.json({ message: 'Thread deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getNotifications, markAsRead, sendNotification, deleteNotification, deleteThread };
