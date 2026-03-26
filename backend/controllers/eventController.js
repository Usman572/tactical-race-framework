const GlobalEvent = require('../models/GlobalEvent');
const socketManager = require('../socket');

const getActiveEvents = async (req, res) => {
    try {
        const now = new Date();
        const events = await GlobalEvent.find({
            isActive: true,
            startTime: { $lte: now },
            endTime: { $gte: now }
        });
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const createEvent = async (req, res) => {
    try {
        const { title, description, type, multiplier, startTime, endTime, id, linkedRaceId } = req.body;

        const event = await GlobalEvent.create({
            title,
            description,
            type,
            multiplier,
            startTime: startTime || new Date(),
            endTime,
            id,
            linkedRaceId
        });

        // Broadcast to all operatives
        try {
            const io = socketManager.getIO();
            io.emit('global_mission_alert', event);
        } catch (socketErr) {
            console.error('Socket broadcast failed:', socketErr);
        }

        res.status(201).json(event);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deactivateEvent = async (req, res) => {
    try {
        const event = await GlobalEvent.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getActiveEvents, createEvent, deactivateEvent };
