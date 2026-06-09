const ChatMessage = require('../models/ChatMessage');
const socketManager = require('../socket');

const getRaceChat = async (req, res) => {
    try {
        const messages = await ChatMessage.find({ race: req.params.raceId })
            .populate('user', 'name profilePicture rank slug')
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const sendRaceMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const { raceId } = req.params;
        const userId = req.user._id;

        const Race = require('../models/Race');
        const race = await Race.findById(raceId);
        
        let messageType = 'Standard';
        if (race && (race.createdBy?.toString() === userId.toString() || req.user.role === 'admin')) {
            messageType = 'Tactical';
        }

        const message = await ChatMessage.create({
            race: raceId,
            user: userId,
            text,
            messageType
        });

        // Award dynamic XP for signals
        const userObj = await require('../models/User').findById(userId);
        if (userObj) {
            const { awardXP } = require('../utils/gamification');
            
            // Check daily cap (e.g., 50 XP per day from chat)
            const today = new Date().setHours(0,0,0,0);
            const lastUpdate = userObj.lastXPUpdate ? new Date(userObj.lastXPUpdate).setHours(0,0,0,0) : 0;
            
            if (lastUpdate < today) {
                userObj.dailyXP = 0;
                userObj.lastXPUpdate = new Date();
            }

            if (userObj.dailyXP < 50) {
                await awardXP(userObj, 5, 'Signal Broadcast Detected');
                userObj.dailyXP += 5;
                await userObj.save();
            }

            const { updateMissionProgress } = require('./missionController');
            await updateMissionProgress(userObj._id, 'msg');
        }

        const populatedMessage = await message.populate('user', 'name profilePicture rank slug');

        // Emit to the race room
        try {
            const io = socketManager.getIO();
            io.to(`race_${raceId}`).emit('new_race_message', populatedMessage);
        } catch (socketErr) {
            console.error('Socket emit failed:', socketErr);
        }

        res.status(201).json(populatedMessage);
    } catch (err) {
        console.error('sendRaceMessage error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const sendPrivateMessage = async (req, res) => {
    try {
        const { text, recipientId } = req.body;
        const senderId = req.user._id;

        if (!recipientId) return res.status(400).json({ message: 'Recipient required' });

        let mediaUrl = null;
        let type = 'Message';

        if (req.file) {
            mediaUrl = `/uploads/${req.file.filename}`;
            const mime = req.file.mimetype;
            if (mime.startsWith('image/')) type = 'Image';
            else if (mime.startsWith('video/')) type = 'Video';
            else if (mime.startsWith('audio/')) type = 'Audio';
        }

        const message = await ChatMessage.create({
            user: senderId,
            recipient: recipientId,
            text: text || `Sent a ${type.toLowerCase()}`,
            mediaUrl,
            type,
            isEncrypted: !req.file // Don't scramble media notifications by default
        });

        const populatedMessage = await message.populate([
            { path: 'user', select: 'name profilePicture rank slug' },
            { path: 'recipient', select: 'name profilePicture rank slug' }
        ]);

        // Map for frontend compatibility (matches notificationController.js mapping)
        const mappedMessage = {
            _id: populatedMessage._id,
            recipient: populatedMessage.recipient,
            sender: populatedMessage.user,
            message: populatedMessage.text,
            type: populatedMessage.type,
            mediaUrl: populatedMessage.mediaUrl,
            read: populatedMessage.read,
            createdAt: populatedMessage.createdAt,
            updatedAt: populatedMessage.updatedAt
        };

        // Emit to both user rooms
        try {
            const io = require('../socket').getIO();
            io.to(recipientId.toString()).emit('new_private_message', mappedMessage);
            io.to(senderId.toString()).emit('new_private_message', mappedMessage);
        } catch (err) {}

        res.status(201).json(mappedMessage);
    } catch (err) {
        console.error('sendPrivateMessage error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getPrivateChat = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const userId = req.user._id;

        const messages = await ChatMessage.find({
            $or: [
                { user: userId, recipient: otherUserId },
                { user: otherUserId, recipient: userId }
            ],
            race: { $exists: false } // Only 1v1 messages
        })
        .populate('user', 'name profilePicture rank slug')
        .sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getFactionChat = async (req, res) => {
    try {
        const faction = req.user.faction;
        if (!faction || faction === 'None') {
            return res.status(400).json({ message: 'User is not part of a syndicate' });
        }

        const messages = await ChatMessage.find({
            faction,
            race: { $exists: false },
            recipient: { $exists: false }
        })
        .populate('user', 'name profilePicture rank slug')
        .sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        console.error('getFactionChat error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const sendFactionMessage = async (req, res) => {
    try {
        const { text, isHighPriority } = req.body;
        const faction = req.user.faction;
        const userId = req.user._id;

        if (!faction || faction === 'None') {
            return res.status(400).json({ message: 'User is not part of a syndicate' });
        }

        const message = await ChatMessage.create({
            user: userId,
            faction,
            text,
            isEncrypted: isHighPriority === true,
            isHighPriority: isHighPriority === true,
            messageType: 'Standard'
        });

        const populatedMessage = await message.populate('user', 'name profilePicture rank slug');

        // Emit to faction socket room
        try {
            const io = socketManager.getIO();
            io.to(`faction_${faction}`).emit('new_faction_message', populatedMessage);
        } catch (socketErr) {
            console.error('Faction Socket emit failed:', socketErr);
        }

        res.status(201).json(populatedMessage);
    } catch (err) {
        console.error('sendFactionMessage error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getTacticalBroadcasts = async (req, res) => {
    try {
        const messages = await ChatMessage.find({
            isTacticalBroadcast: true
        })
        .populate('user', 'name profilePicture rank slug')
        .sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        console.error('getTacticalBroadcasts error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const sendTacticalBroadcast = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only administrators can broadcast tactical alerts' });
        }

        const { text, isHighPriority } = req.body;
        const userId = req.user._id;

        const message = await ChatMessage.create({
            user: userId,
            isTacticalBroadcast: true,
            text,
            isEncrypted: isHighPriority === true,
            isHighPriority: isHighPriority === true,
            messageType: 'Tactical'
        });

        const populatedMessage = await message.populate('user', 'name profilePicture rank slug');

        // Emit to tactical broadcast room
        try {
            const io = socketManager.getIO();
            io.to('tactical_broadcasts').emit('new_tactical_broadcast', populatedMessage);
        } catch (socketErr) {
            console.error('Broadcast Socket emit failed:', socketErr);
        }

        res.status(201).json(populatedMessage);
    } catch (err) {
        console.error('sendTacticalBroadcast error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const decryptMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await ChatMessage.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Transmission not found' });
        }

        // Add user to decryptedBy list
        if (!message.decryptedBy.includes(userId)) {
            message.decryptedBy.push(userId);
            await message.save();
        }

        const populatedMessage = await message.populate('user', 'name profilePicture rank slug');
        res.json(populatedMessage);
    } catch (err) {
        console.error('decryptMessage error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { 
    getRaceChat, 
    sendRaceMessage, 
    sendPrivateMessage, 
    getPrivateChat,
    getFactionChat,
    sendFactionMessage,
    getTacticalBroadcasts,
    sendTacticalBroadcast,
    decryptMessage
};
