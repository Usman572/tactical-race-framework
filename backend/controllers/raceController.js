const Race = require('../models/Race.js');
const User = require('../models/User.js');
const Notification = require('../models/Notification.js');
const JoinRequest = require('../models/JoinRequest.js');
const SectorOwnership = require('../models/SectorOwnership.js');
const socketManager = require('../socket');

const getRaceById = async (req, res) => {
    try {
        const race = await Race.findById(req.params.id)
            .populate('participants', 'name email slug faction profilePicture')
            .populate('createdBy', 'name email role slug profilePicture')
            .populate('checkIns', 'name profilePicture slug faction');

        if (!race) return res.status(404).json({ message: 'Race not found' });

        // Check for linked Global Events
        const GlobalEvent = require('../models/GlobalEvent');
        const linkedEvent = await GlobalEvent.findOne({ 
            linkedRaceId: race._id,
            isActive: true 
        });

        res.json({ ...race._doc, linkedEvent });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getRaces = async (req, res) => {
    try {
        const races = await Race.find()
            .populate('participants', 'name email slug')
            .populate('createdBy', 'name email role slug');

        // Lazy migration: Ensure all populated users have slugs
        for (const race of races) {
            if (race.createdBy && !race.createdBy.slug) {
                // We'd need the User model here or a shared helper
                // For now, let's keep it simple and rely on the fact that viewing a profile or user list migrates them.
                // But let's at least make sure we don't return null slugs if we can help it.
            }
        }

        res.json(races);
    } catch (err) {
        console.error('getRaces error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const createRace = async (req, res) => {
    try {
        const { name, location, date, type, status, trackLength, sector, bannerImage, maxParticipants, registrationDeadline } = req.body;
        if (!name || !location || !date) {
            return res.status(400).json({ message: 'Name, location and date are required' });
        }
        const createdBy = req.user?._id || null;
        const race = await Race.create({
            name, location, date, type, status, trackLength, sector, bannerImage, createdBy,
            maxParticipants: maxParticipants || null,
            registrationDeadline: registrationDeadline || null,
        });

        // XP Award for creation
        if (createdBy) {
            const user = await User.findById(createdBy);
            if (user) {
                const { awardXP } = require('../utils/gamification');
                await awardXP(user, 50, 'Race Deployment Created');
            }
        }

        // Emit real-time creation
        try {
            const io = socketManager.getIO();
            const populatedRace = await Race.findById(race._id).populate('createdBy', 'name email role slug');
            io.emit('race_created', populatedRace);
        } catch (socketErr) {
            console.error('Socket emit for race_created failed');
        }

        await race.populate('createdBy', 'name email role slug');
        res.status(201).json(race);
    } catch (err) {
        console.error('createRace error:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

const updateRace = async (req, res) => {
    try {
        const { name, location, date, type, status, trackLength, sector, bannerImage, maxParticipants, registrationDeadline } = req.body;
        const race = await Race.findById(req.params.id);

        if (!race) return res.status(404).json({ message: 'Race not found' });

        // Authorization: Only creator or admin can update
        if (race.createdBy?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this race' });
        }

        const updatedRace = await Race.findByIdAndUpdate(
            req.params.id,
            { name, location, date, type, status, trackLength, sector, bannerImage,
              maxParticipants: maxParticipants || null,
              registrationDeadline: registrationDeadline || null,
            },
            { new: true, runValidators: true }
        );
        await updatedRace.populate('createdBy', 'name email role slug');
        res.json(updatedRace);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteRace = async (req, res) => {
    try {
        const race = await Race.findById(req.params.id);
        if (!race) return res.status(404).json({ message: 'Race not found' });

        // Authorization: Only creator or admin can delete
        if (race.createdBy?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this race' });
        }

        await Race.findByIdAndDelete(req.params.id);

        // Emit real-time deletion
        try {
            const socketManager = require('../socket');
            const io = socketManager.getIO();
            io.emit('race_deleted', req.params.id);
        } catch (socketErr) {
            console.error('Socket emit for race_deleted failed');
        }

        res.json({ message: 'Race deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const requestToJoin = async (req, res) => {
    try {
        const race = await Race.findById(req.params.id);
        if (!race) return res.status(404).json({ message: 'Race not found' });

        const userId = req.user._id;

        // Already a participant?
        if (race.participants.some(p => p.equals(userId))) {
            return res.status(400).json({ message: 'Already a participant' });
        }

        // Existing pending request?
        const existingRequest = await JoinRequest.findOne({ race: race._id, user: userId, status: 'Pending' });
        if (existingRequest) {
            return res.status(400).json({ message: 'Join request already pending' });
        }

        // Check registration deadline
        if (race.registrationDeadline && new Date() > new Date(race.registrationDeadline)) {
            return res.status(400).json({ message: 'Registration deadline has passed' });
        }

        // Check capacity
        if (race.maxParticipants && race.participants.length >= race.maxParticipants) {
            return res.status(400).json({ message: 'Race is full. No slots available.' });
        }

        const { message, vehicleDetails, experience } = req.body;
        const request = await JoinRequest.create({
            race: race._id,
            user: userId,
            message: message || '',
            vehicleDetails: vehicleDetails || '',
            experience: experience || 'Rookie',
        });

        // Notify creator using utility
        if (race.createdBy) {
            const { createNotification } = require('../utils/notification');
            await createNotification({
                recipient: race.createdBy,
                sender: userId,
                race: race._id,
                joinRequest: request._id,
                type: 'JoinRequest',
                message: `${req.user.name} wants to join: ${race.name}`,
            });
        }

        res.status(201).json(request);
    } catch (err) {
        console.error('requestToJoin error:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

const approveJoinRequest = async (req, res) => {
    try {
        const request = await JoinRequest.findById(req.params.id).populate('race user');
        if (!request) return res.status(404).json({ message: 'Request not found' });

        // Authorization: Only race creator or admin
        if (request.race.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (request.status !== 'Pending') {
            return res.status(400).json({ message: 'Request already processed' });
        }

        request.status = 'Approved';
        await request.save();

        const race = await Race.findById(request.race._id);
        if (!race.participants.some(p => p.equals(request.user._id))) {
            race.participants.push(request.user._id);
            await race.save();

            // Points & Stats update
            const participant = await User.findById(request.user._id);
            if (participant) {
                participant.stats.racesJoined += 1;
                const { awardXP } = require('../utils/gamification');
                await awardXP(participant, 50, 'Deployment Access Granted');
                
                const { updateMissionProgress } = require('./missionController');
                await updateMissionProgress(participant._id, 'join');
            }
        }

        // Notify user using utility
        const { createNotification } = require('../utils/notification');
        await createNotification({
            recipient: request.user._id,
            sender: req.user._id,
            race: race._id,
            type: 'Alert',
            message: `Your request to join ${race.name} was approved!`,
        });

        // Mark the join request notification as read
        await Notification.updateMany({ joinRequest: request._id }, { read: true });

        // Emit real-time update
        try {
            const socketManager = require('../socket');
            const io = socketManager.getIO();
            const populatedRace = await Race.findById(race._id)
                .populate('participants', 'name email slug')
                .populate('createdBy', 'name email role slug');
            io.emit('race_updated', populatedRace);
        } catch (socketErr) {
            console.error('Socket emit for race_updated failed');
        }

        res.json({ message: 'Approved', race });
    } catch (err) {
        console.error('approveJoinRequest error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const rejectJoinRequest = async (req, res) => {
    try {
        const request = await JoinRequest.findById(req.params.id).populate('race');
        if (!request) return res.status(404).json({ message: 'Request not found' });

        // Authorization
        if (request.race.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        request.status = 'Rejected';
        await request.save();

        // Notify user using utility
        const { createNotification } = require('../utils/notification');
        await createNotification({
            recipient: request.user,
            sender: req.user._id,
            race: request.race._id,
            type: 'Alert',
            message: `Your request to join ${request.race.name} was declined.`,
        });

        // Mark as read
        await Notification.updateMany({ joinRequest: request._id }, { read: true });

        res.json({ message: 'Rejected' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const joinRace = async (req, res) => {
    // Keep this for legacy or admin direct join if needed, but primarily use request flow
    try {
        const race = await Race.findById(req.params.id);
        if (!race) return res.status(404).json({ message: 'Race not found' });

        const userId = req.user._id;
        if (race.participants.some(p => p.equals(userId))) {
            return res.status(400).json({ message: 'Already joined' });
        }

        // For now, let's just make it a direct join if specifically called, but UI will use request flow
        race.participants.push(userId);
        await race.save();

        const participant = await User.findById(userId);
        if (participant) {
            participant.stats.racesJoined += 1;
            participant.stats.points += 10;
            await participant.save();
        }

        res.json(race);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const leaveRace = async (req, res) => {
    try {
        const race = await Race.findById(req.params.id);
        if (!race) return res.status(404).json({ message: 'Race not found' });

        const userId = req.user._id;
        const participantIndex = race.participants.indexOf(userId);

        // Use string comparison or p.equals() for reliability
        const joinedIndex = race.participants.findIndex(p => p.toString() === userId.toString());

        if (joinedIndex === -1) {
            return res.status(400).json({ message: 'You are not a participant in this race' });
        }

        // Remove from list
        race.participants.splice(joinedIndex, 1);
        await race.save();

        // Deduct points/stats
        const user = await User.findById(userId);
        if (user) {
            user.stats.racesJoined = Math.max(0, (user.stats.racesJoined || 1) - 1);
            user.stats.points = Math.max(0, (user.stats.points || 10) - 10);
            await user.save();
        }

        await race.populate('participants', 'name email slug');

        // Emit real-time update
        // Emit real-time update
        try {
            const io = socketManager.getIO();
            io.emit('race_updated', race);
        } catch (socketErr) {
            console.error('Socket emit for race_updated failed');
        }

        res.json(race);
    } catch (err) {
        console.error('leaveRace error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};




const searchAll = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ races: [], users: [] });

        const regex = new RegExp(q, 'i');

        const [races, users] = await Promise.all([
            Race.find({
                $or: [
                    { name: regex },
                    { location: regex },
                    { type: regex }
                ]
            }).limit(10).select('name location date type slug'),
            User.find({
                $or: [
                    { name: regex },
                    { email: regex }
                ]
            }).limit(10).select('name profilePicture slug role')
        ]);

        res.json({ races, users });
    } catch (err) {
        console.error('searchAll error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getPendingRequests = async (req, res) => {
    try {
        // Find all pending requests for races created by the current user
        const races = await Race.find({ createdBy: req.user._id });
        const raceIds = races.map(r => r._id);
        
        const requests = await JoinRequest.find({ 
            race: { $in: raceIds },
            status: 'Pending'
        }).populate('race user', 'name email slug');
        
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getMyRequests = async (req, res) => {
    try {
        const requests = await JoinRequest.find({ user: req.user._id })
            .populate('race', 'name location date type slug');
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const checkIn = async (req, res) => {
    try {
        const race = await Race.findById(req.params.id);
        if (!race) return res.status(404).json({ message: 'Race not found' });

        if (!race.participants.some(p => p.equals(req.user._id))) {
            return res.status(403).json({ message: 'Only participants can check in' });
        }

        if (!race.checkIns.some(p => p.equals(req.user._id))) {
            race.checkIns.push(req.user._id);
            await race.save();

            const { updateMissionProgress } = require('./missionController');
            await updateMissionProgress(req.user._id, 'checkin');

            // Emit update
            try {
                const io = socketManager.getIO();
                const populatedRace = await Race.findById(race._id)
                    .populate('participants', 'name profilePicture slug')
                    .populate('checkIns', 'name profilePicture slug');
                io.emit('race_updated', populatedRace);
            } catch (err) {}
        }
        res.json(race);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const startCountdown = async (req, res) => {
    try {
        const race = await Race.findById(req.params.id);
        if (!race) return res.status(404).json({ message: 'Race not found' });

        if (race.createdBy?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const startTime = new Date(Date.now() + 10000); // 10 seconds from now
        race.startTime = startTime;
        // We keep it 'Active' during countdown, then transition to 'Live' on engagement
        await race.save();

        // Emit countdown start
        try {
            const io = socketManager.getIO();
            io.emit('race_countdown_start', { raceId: race._id, startTime });
        } catch (err) {}

        res.json(race);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateTelemetry = async (req, res) => {
    try {
        const { id } = req.params;
        const { progress, speed, lap, status, userId: targetUserId } = req.body;
        
        const race = await Race.findById(id);
        if (!race) return res.status(404).json({ message: 'Race not found' });

        // Authorization: A user can update their own telemetry. 
        // A creator/admin can update anyone's (for simulation/correction).
        const isCreator = race.createdBy?.toString() === req.user._id.toString() || req.user.role === 'admin';
        const userId = (isCreator && targetUserId) ? targetUserId : req.user._id;

        // Ensure race is live or starting
        if (race.status !== 'Live' && race.status !== 'Active') {
            return res.status(400).json({ message: 'Race is not currently engaged' });
        }

        // Find or initialize telemetry entry for this user
        let userTelemIndex = race.telemetry.findIndex(t => t.user.toString() === userId.toString());
        
        const updateData = {
            user: userId,
            progress: progress !== undefined ? progress : (userTelemIndex > -1 ? race.telemetry[userTelemIndex].progress : 0),
            speed: speed !== undefined ? speed : (userTelemIndex > -1 ? race.telemetry[userTelemIndex].speed : 0),
            lap: lap !== undefined ? lap : (userTelemIndex > -1 ? race.telemetry[userTelemIndex].lap : 1),
            status: status || (userTelemIndex > -1 ? race.telemetry[userTelemIndex].status : 'En Route'),
            lastUpdated: Date.now()
        };

        if (userTelemIndex > -1) {
            race.telemetry[userTelemIndex] = updateData;
        } else {
            race.telemetry.push(updateData);
        }

        // Optimize: Don't await save if we are just broadcasting, but we need persistence for HUD reloads
        await race.save();

        // Broadcast pulse
        try {
            const io = socketManager.getIO();
            io.to(`race_${id}`).emit('telemetry_pulse', {
                raceId: id,
                userId,
                telemetry: updateData
            });
        } catch (err) {}

        res.json({ success: true });
    } catch (err) {
        console.error('updateTelemetry error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const handleRaceCommand = async (req, res) => {
    try {
        const { id } = req.params;
        const { command, payload } = req.body;

        const race = await Race.findById(id);
        if (!race) return res.status(404).json({ message: 'Race not found' });

        // Authorization
        if (race.createdBy?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        let updatedStatus = race.status;

        if (command === 'ENGAGE') {
            updatedStatus = 'Live';
            race.status = 'Live';
            if (!race.startTime) race.startTime = new Date();
        } else if (command === 'ABORT') {
            updatedStatus = 'Cancelled';
            race.status = 'Cancelled';
        } else if (command === 'PAUSE') {
            // We can add a 'Paused' state if needed, for now just broadcast
        }

        await race.save();

        // Broadcast command
        try {
            const io = socketManager.getIO();
            io.to(`race_${id}`).emit('command_pulse', {
                raceId: id,
                command,
                payload,
                status: updatedStatus
            });
        } catch (err) {}

        res.json({ success: true, status: updatedStatus });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const completeRace = async (req, res) => {
    try {
        const { winners } = req.body; // Array of { userId, position, time }
        const race = await Race.findById(req.params.id);
        if (!race) return res.status(404).json({ message: 'Race not found' });

        if (race.createdBy?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        race.status = 'Completed';
        race.winners = winners;
        await race.save();

        // 🏆 SECTOR DOMINANCE LOGIC
        if (race.sector && race.sector !== 'Unassigned') {
            try {
                let sector = await SectorOwnership.findOne({ sectorName: race.sector });
                if (!sector) {
                    sector = await SectorOwnership.create({
                        sectorName: race.sector,
                        ownership: [
                            { faction: 'Cyber Shadows', points: 0 },
                            { faction: 'The Vanguard', points: 0 },
                            { faction: 'Neon Pulse', points: 0 },
                            { faction: 'Void Runners', points: 0 }
                        ]
                    });
                }

                // Award points based on winner factions
                for (const w of winners) {
                    const winnerUser = await User.findById(w.user);
                    if (winnerUser && winnerUser.faction && winnerUser.faction !== 'None') {
                        const pointsGained = w.position === 1 ? 50 : w.position === 2 ? 25 : 10;
                        const factionEntry = sector.ownership.find(o => o.faction === winnerUser.faction);
                        if (factionEntry) {
                            factionEntry.points += pointsGained;
                        }
                    }
                }

                // Update owner
                const prevOwner = sector.currentOwner;
                const topFaction = [...sector.ownership].sort((a, b) => b.points - a.points)[0];
                if (topFaction && topFaction.points > 0) {
                    sector.currentOwner = topFaction.faction;
                }
                sector.lastBattleAt = Date.now();
                await sector.save();

                // Global Broadcast of Territory Shift
                try {
                    const io = socketManager.getIO();
                    io.emit('territory_update', {
                        sector: sector.sectorName,
                        owner: sector.currentOwner,
                        points: sector.ownership,
                        takeover: prevOwner !== sector.currentOwner
                    });
                } catch (err) {}

            } catch (err) {
                console.error('Sector Dominance error:', err);
            }
        }

        // Award XP to winners
        const { awardXP } = require('../utils/gamification');
        for (const w of winners) {
            const user = await User.findById(w.user);
            if (user) {
                const xpGain = w.position === 1 ? 250 : w.position === 2 ? 150 : 100;
                if (w.position === 1) user.stats.wins += 1;
                await awardXP(user, xpGain, `Race Result: ${w.position === 1 ? 'Podium' : 'Completion'}`);
                
                const { updateMissionProgress } = require('./missionController');
                if (w.position <= 3) await updateMissionProgress(user._id, 'win');
            }
        }

        // Check for linked High-Stakes Event
        const GlobalEvent = require('../models/GlobalEvent');
        const linkedEvent = await GlobalEvent.findOne({ linkedRaceId: race._id, isActive: true });

        if (linkedEvent && Array.isArray(winners)) {
            // Faction Dominance Logic: Top 3 finishers' factions get a boost
            const winningFactions = winners
                .slice(0, 3)
                .map(w => w.user?.faction)
                .filter(f => f && f !== 'None');
            
            const dominantFaction = winningFactions[0]; // Winner's faction is dominant

            if (dominantFaction) {
                // Award bonus XP to all participants of the dominant faction in this race
                const factionParticipants = await User.find({
                    _id: { $in: race.participants },
                    faction: dominantFaction
                });

                for (const fUser of factionParticipants) {
                    await awardXP(fUser, 100, `Faction Dominance: ${dominantFaction} Victory`);
                }

                // Global broadcast of Faction Victory
                try {
                    const io = socketManager.getIO();
                    io.emit('faction_victory', { 
                        faction: dominantFaction, 
                        raceName: race.name,
                        eventId: linkedEvent.id 
                    });
                } catch (err) {}
            }
        }

        // Emit completion
        try {
            const io = socketManager.getIO();
            const populatedRace = await Race.findById(race._id)
                .populate('winners.user', 'name profilePicture rank')
                .populate('participants', 'name email slug');
            io.emit('race_completed', populatedRace);
        } catch (err) {}

        res.json(race);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { 
    getRaces, 
    getRaceById,
    createRace, 
    updateRace, 
    deleteRace, 
    joinRace, 
    leaveRace, 
    searchAll, 
    requestToJoin, 
    approveJoinRequest, 
    rejectJoinRequest, 
    getPendingRequests, 
    getMyRequests,
    checkIn,
    startCountdown,
    completeRace,
    updateTelemetry,
    handleRaceCommand
};
