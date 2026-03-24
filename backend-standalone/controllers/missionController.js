const User = require('../models/User');
const { awardXP } = require('../utils/gamification');

const MISSION_POOL = [
    { id: 'msg_5', title: 'Signal Burst', description: 'Broadcast 5 signals in any active comms channel.', targetValue: 5, xpReward: 50 },
    { id: 'join_1', title: 'Sector Deployment', description: 'Join 1 new race deployment.', targetValue: 1, xpReward: 100 },
    { id: 'win_1', title: 'Elite Performance', description: 'Secure a podium finish (Top 3) in any race.', targetValue: 1, xpReward: 250 },
    { id: 'checkin_1', title: 'On-Site Recon', description: 'Check in to 1 race deployment.', targetValue: 1, xpReward: 50 },
];

const getDailyMissions = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if missions are expired or missing
        const now = new Date();
        const needsReset = !user.dailyMissions || user.dailyMissions.length === 0 || new Date(user.dailyMissions[0].expiresAt) < now;

        if (needsReset) {
            // Pick 3 random missions
            const shuffled = [...MISSION_POOL].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 3).map(m => ({
                ...m,
                currentValue: 0,
                isCompleted: false,
                expiresAt: new Date(new Date().setHours(23, 59, 59, 999)) // End of today
            }));

            user.dailyMissions = selected;
            await user.save();
        }

        res.json(user.dailyMissions);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateMissionProgress = async (userId, missionIdType, amount = 1) => {
    try {
        const user = await User.findById(userId);
        if (!user || !user.dailyMissions) return;

        let changed = false;
        for (const mission of user.dailyMissions) {
            if (mission.id.startsWith(missionIdType) && !mission.isCompleted) {
                mission.currentValue += amount;
                if (mission.currentValue >= mission.targetValue) {
                    mission.isCompleted = true;
                    await awardXP(user, mission.xpReward, `Mission Complete: ${mission.title}`);
                }
                changed = true;
            }
        }

        if (changed) {
            await user.save();
        }
    } catch (err) {
        console.error('updateMissionProgress error:', err);
    }
};

module.exports = { getDailyMissions, updateMissionProgress };
