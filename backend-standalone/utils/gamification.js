const socketManager = require('../socket');
const Notification = require('../models/Notification.js');

const calculateLevel = (xp) => {
    // Simple level formula: Level 1 = 0-999 XP, Level 2 = 1000-2499, etc.
    // Level = floor(sqrt(xp/500)) + 1
    return Math.floor(Math.sqrt(xp / 500)) + 1;
};

const awardXP = async (user, amount, reason) => {
    if (!user) return;

    const oldLevel = user.level || calculateLevel(user.xp || 0);
    user.xp = (user.xp || 0) + amount;
    const newLevel = calculateLevel(user.xp);

    user.level = newLevel;

    // Check for level up
    if (newLevel > oldLevel) {
        // Create notification
        const { createNotification } = require('./notification');
        await createNotification({
            recipient: user._id,
            type: 'Achievement',
            message: `PROMOTED! You reached Level ${newLevel}!`,
        });

        // Emit real-time level up
        try {
            const io = socketManager.getIO();
            io.to(user._id.toString()).emit('level_up', {
                level: newLevel,
                xp: user.xp,
                reason: 'Level Up'
            });
        } catch (err) {}
    }

    // Always emit XP update for the HUD
    try {
        const io = socketManager.getIO();
        io.to(user._id.toString()).emit('xp_update', {
            xp: user.xp,
            level: user.level,
            gain: amount,
            reason
        });
    } catch (err) {}

    await user.save();
    return user;
};

const checkAchievements = async (user, type) => {
    // Current placeholder for achievement logic
    // we can expand this to check for 'First Win', '10 Races', etc.
};

module.exports = { awardXP, calculateLevel, checkAchievements };
