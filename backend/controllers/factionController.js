const SectorOwnership = require('../models/SectorOwnership');

const getTerritories = async (req, res) => {
    try {
        const territories = await SectorOwnership.find();
        
        // If no territories exist (fresh start), return defaults
        if (territories.length === 0) {
            const defaults = ['Neon District', 'Outlands', 'The Void', 'Cyber City', 'Industrial Zone'].map(s => ({
                sectorName: s,
                currentOwner: 'None',
                ownership: []
            }));
            return res.json(defaults);
        }

        res.json(territories);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getFactionStats = async (req, res) => {
    try {
        const User = require('../models/User');
        const factions = ['Cyber Shadows', 'The Vanguard', 'Neon Pulse', 'Void Runners'];
        
        const stats = await Promise.all(factions.map(async (f) => {
            const count = await User.countDocuments({ faction: f });
            const users = await User.find({ faction: f }).select('xp stats.wins');
            const totalXP = users.reduce((sum, u) => sum + (u.xp || 0), 0);
            const totalWins = users.reduce((sum, u) => sum + (u.stats?.wins || 0), 0);
            
            return {
                name: f,
                operatives: count,
                totalXP,
                totalWins
            };
        }));

        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getTerritories, getFactionStats };
