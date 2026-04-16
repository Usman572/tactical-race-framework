const socketManager = require('../socket');
const Notification = require('../models/Notification.js');

const calculateLevel = (xp) => {
    // Simple level formula: Level 1 = 0-999 XP, Level 2 = 1000-2499, etc.
    // Level = floor(sqrt(xp/500)) + 1
    return Math.floor(Math.sqrt(xp / 500)) + 1;
};

const awardXP = async (user, amount, reason, sectorName = null) => {
    if (!user) return;

    // Check for multipliers
    let multiplier = 1;
    
    // 1. Global XP Boosts
    try {
        const GlobalEvent = require('../models/GlobalEvent');
        const activeBoosts = await GlobalEvent.find({
            type: 'XP_BOOST',
            isActive: true,
            startTime: { $lte: new Date() },
            endTime: { $gte: new Date() }
        });
        
        if (activeBoosts.length > 0) {
            multiplier = Math.max(...activeBoosts.map(b => b.multiplier || 1));
        }
    } catch (err) {
        console.error('Multiplier check failed', err);
    }

    // 2. Faction Territory Perk (15% Bonus)
    if (sectorName && user.faction && user.faction !== 'None') {
        try {
            const SectorOwnership = require('../models/SectorOwnership');
            const sector = await SectorOwnership.findOne({ sectorName });
            if (sector && sector.currentOwner === user.faction) {
                multiplier *= 1.15;
            }
        } catch (err) {
            console.error('Faction perk check failed', err);
        }
    }

    const finalAmount = Math.round(amount * multiplier);

    const oldLevel = user.level || calculateLevel(user.xp || 0);
    user.xp = (user.xp || 0) + finalAmount;
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
            gain: finalAmount,
            multiplier, // Pass the multiplier for frontend feedback
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
