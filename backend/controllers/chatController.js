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
        const user = req.user._id;

        const message = await ChatMessage.create({
            race: raceId,
            user: userId,
            text
        });

        // Award dynamic XP for signals
        const userObj = await require('../models/User').findById(userId);
        if (userObj) {
            const { awardXP } = require('../utils/gamification');
            
            // Check daily cap (e.g., 50 XP per day from chat)
            const today = new Date().setHours(0,0,0,0);
            const lastUpdate = new Date(userObj.lastXPUpdate).setHours(0,0,0,0);
            
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
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getRaceChat, sendRaceMessage };
