const User = require('../models/User');
const Race = require('../models/Race');

// @desc    Get aggregate platform stats
// @route   GET /api/stats/summary
// @access  Private/Admin
const getPlatformSummary = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalRaces = await Race.countDocuments();
        
        // Faction Power Distribution
        const factionStats = await User.aggregate([
            { $group: { _id: '$faction', totalXP: { $sum: '$xp' }, count: { $sum: 1 } } }
        ]);

        // Race Status Distribution
        const statusStats = await Race.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Sector Distribution
        const sectorStats = await Race.aggregate([
            { $group: { _id: '$sector', count: { $sum: 1 } } }
        ]);

        res.json({
            summary: {
                totalUsers,
                totalRaces,
                activeOperatives: await User.countDocuments({ lastXPUpdate: { $gt: new Date(Date.now() - 24*60*60*1000) } })
            },
            factions: factionStats.map(f => ({
                name: f._id === 'None' ? 'Unaligned' : f._id,
                xp: f.totalXP,
                operatives: f.count
            })),
            raceStatus: statusStats.map(s => ({
                status: s._id,
                count: s.count
            })),
            sectors: sectorStats.map(s => ({
                name: s._id,
                count: s.count
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get race trends over time
// @route   GET /api/stats/trends
// @access  Private/Admin
const getRaceTrends = async (req, res) => {
    try {
        const trends = await Race.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 30 } // Last 30 days
        ]);

        res.json(trends.map(t => ({
            date: t._id,
            deployments: t.count
        })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPlatformSummary,
    getRaceTrends
};
