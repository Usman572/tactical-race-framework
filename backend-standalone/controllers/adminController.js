const User = require('../models/User');
const Race = require('../models/Race');

const getAdminStats = async (req, res) => {
    try {
        const [userCount, racerCount, partnerCount, raceCount, activeRaceCount] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'partner' }),
            Race.countDocuments(),
            Race.countDocuments({ status: 'Active' })
        ]);

        // Simulating some "Operational Load" based on system factors
        // In a real app, this might involve CPU usage or request volume
        const operationalLoad = Math.floor(Math.random() * (98 - 85 + 1)) + 85;

        res.json({
            users: {
                total: userCount,
                racers: racerCount,
                partners: partnerCount
            },
            races: {
                total: raceCount,
                active: activeRaceCount
            },
            system: {
                load: `${operationalLoad}%`,
                status: 'HEALTHY',
                lastSync: new Date().toISOString()
            }
        });
    } catch (err) {
        console.error('getAdminStats error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAdminStats };
