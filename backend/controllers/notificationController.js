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

        // Also fetch 1v1 ChatMessages
        const ChatMessage = require('../models/ChatMessage');
        const privateMessages = await ChatMessage.find({
            $or: [
                { user: req.user._id, recipient: { $exists: true } },
                { recipient: req.user._id }
            ],
            race: { $exists: false }
        })
            .populate('user', 'name profilePicture rank')
            .populate('recipient', 'name profilePicture rank')
            .sort({ createdAt: -1 });

        // Map ChatMessages to look like Notifications for frontend compatibility
        const mappedPrivateMessages = privateMessages.map(msg => ({
            _id: msg._id,
            recipient: msg.recipient,
            sender: msg.user,
            message: msg.text,
            type: msg.type || 'Message',
            mediaUrl: msg.mediaUrl,
            read: msg.read,
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt
        }));

        const combined = [...notifications, ...mappedPrivateMessages].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        res.json(combined);
    } catch (err) {
        console.error('getNotifications error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const markAsRead = async (req, res) => {
    try {
        let notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );

        if (!notification) {
            const ChatMessage = require('../models/ChatMessage');
            notification = await ChatMessage.findByIdAndUpdate(
                req.params.id,
                { read: true },
                { new: true }
            );
        }

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
        let notification = await Notification.findById(req.params.id);
        let Model = Notification;

        if (!notification) {
            const ChatMessage = require('../models/ChatMessage');
            notification = await ChatMessage.findById(req.params.id);
            Model = ChatMessage;
        }

        if (!notification) return res.status(404).json({ message: 'Notification/Message not found' });

        // Authorization: Either the sender or the recipient can delete the record
        // For ChatMessage, sender is 'user' field
        const senderId = notification.sender || notification.user;
        const isRecipient = notification.recipient.toString() === req.user._id.toString();
        const isSender = senderId.toString() === req.user._id.toString();

        if (!isRecipient && !isSender) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Model.findByIdAndDelete(req.params.id);
        res.json({ message: 'Record deleted' });
    } catch (err) {
        console.error('deleteNotification error:', err);
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

        const ChatMessage = require('../models/ChatMessage');
        await ChatMessage.deleteMany({
            $or: [
                { recipient: req.user._id, user: senderId },
                { recipient: senderId, user: req.user._id }
            ],
            race: { $exists: false }
        });

        res.json({ message: 'Thread deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getNotifications, markAsRead, sendNotification, deleteNotification, deleteThread };
