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

        const message = await ChatMessage.create({
            user: senderId,
            recipient: recipientId,
            text,
            isEncrypted: true
        });

        const populatedMessage = await message.populate([
            { path: 'user', select: 'name profilePicture rank slug' },
            { path: 'recipient', select: 'name profilePicture rank slug' }
        ]);

        // Emit to both user rooms (for real-time update on both ends)
        try {
            const io = socketManager.getIO();
            // Send to recipient
            io.to(recipientId.toString()).emit('new_private_message', populatedMessage);
            // Send back to sender (if they have multiple tabs/devices)
            io.to(senderId.toString()).emit('new_private_message', populatedMessage);
        } catch (err) {}

        res.status(201).json(populatedMessage);
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

module.exports = { getRaceChat, sendRaceMessage, sendPrivateMessage, getPrivateChat };
