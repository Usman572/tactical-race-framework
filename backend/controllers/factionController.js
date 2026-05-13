const SectorOwnership = require('../models/SectorOwnership');
const User = require('../models/User');
const socketManager = require('../socket');

const getTerritories = async (req, res) => {
    try {
        let territories = await SectorOwnership.find();
        
        // Seed initial data if empty
        if (territories.length === 0) {
            const initialData = [
                {
                    sectorName: 'Neon District',
                    currentOwner: 'Neon Pulse',
                    influencePoints: 500,
                    boundary: [[15, -10], [25, -10], [25, 10], [15, 10]]
                },
                {
                    sectorName: 'Outlands',
                    currentOwner: 'The Vanguard',
                    influencePoints: 500,
                    boundary: [[5, -20], [15, -20], [15, 0], [5, 0]]
                },
                {
                    sectorName: 'The Void',
                    currentOwner: 'Void Runners',
                    influencePoints: 500,
                    boundary: [[25, 0], [35, 0], [35, 20], [25, 20]]
                },
                {
                    sectorName: 'Cyber City',
                    currentOwner: 'Cyber Shadows',
                    influencePoints: 500,
                    boundary: [[5, 10], [15, 10], [15, 30], [5, 30]]
                },
                {
                    sectorName: 'Industrial Zone',
                    currentOwner: 'None',
                    influencePoints: 0,
                    boundary: [[15, 15], [25, 15], [25, 35], [15, 35]]
                }
            ];
            territories = await SectorOwnership.insertMany(initialData);
        }
        
        res.json(territories);
    } catch (err) {
        res.status(500).json({ message: err.message });
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

const updateInfluence = async (sectorName, winningFaction, points) => {
    try {
        let territory = await SectorOwnership.findOne({ sectorName });
        if (!territory) return;

        const THRESHOLD = 1000; // Points needed to flip a sector

        if (territory.currentOwner === winningFaction) {
            // Strengthen hold
            territory.influencePoints += points;
        } else {
            // Contested: reduce current owner's influence
            territory.influencePoints -= points;

            if (territory.influencePoints <= 0) {
                // Ownership flip!
                const previousOwner = territory.currentOwner;
                territory.currentOwner = winningFaction;
                territory.influencePoints = Math.abs(territory.influencePoints) + 100; // Base starting influence
                territory.lastContested = Date.now();

                // Broadcast flip
                try {
                    const io = socketManager.getIO();
                    io.emit('territory_flip', {
                        sectorName,
                        newOwner: winningFaction,
                        previousOwner
                    });
                } catch (err) {}
            }
        }

        // Cap influence points to prevent runaway scores
        if (territory.influencePoints > 2000) territory.influencePoints = 2000;

        await territory.save();

        // Broadcast general update
        try {
            const io = socketManager.getIO();
            io.emit('territory_update', territory);
        } catch (err) {}

        return territory;
    } catch (err) {
        console.error('Error updating influence:', err);
    }
};

module.exports = { getTerritories, getFactionStats, updateInfluence };
