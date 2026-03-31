const Race = require('../models/Race');
const JoinRequest = require('../models/JoinRequest');

const getPartnerStats = async (req, res) => {
    try {
        const partnerId = req.user._id;

        // Find all races created by partner
        const races = await Race.find({ createdBy: partnerId });

        const totalRaces = races.length;
        const activeRaces = races.filter(r => r.status === 'Active').length;

        // Calculate total participants across all their races
        const totalParticipants = races.reduce((sum, race) => sum + (race.participants ? race.participants.length : 0), 0);

        // Get pending join requests specifically for their races
        const raceIds = races.map(r => r._id);
        const pendingRequests = await JoinRequest.countDocuments({
            race: { $in: raceIds },
            status: 'Pending'
        });

        res.json({
            totalRaces,
            activeRaces,
            totalParticipants,
            pendingRequests
        });
    } catch (error) {
        console.error('getPartnerStats error:', error);
        res.status(500).json({ message: 'Server error fetching partner stats' });
    }
};

module.exports = { getPartnerStats };
