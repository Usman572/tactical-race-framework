const mongoose = require('mongoose');

const raceSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        location: { type: String, required: true },
        date: { type: Date, required: true },
        type: { type: String, enum: ['Marathon', 'Sprint', 'Street', 'Circuit', 'Drift'], default: 'Marathon' },
        trackLength: { type: Number, default: 0 },
        status: { type: String, enum: ['Active', 'Cancelled', 'Completed', 'Draft', 'Live'], default: 'Active' },
        sector: { type: String, enum: ['Neon District', 'Outlands', 'The Void', 'Cyber City', 'Industrial Zone'], default: 'Neon District' },
        bannerImage: { type: String, default: '' },
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        checkIns: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        startTime: { type: Date },
        totalLaps: { type: Number, default: 1 },
        currentLap: { type: Number, default: 0 },
        telemetry: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            progress: { type: Number, default: 0 }, // 0 to 100
            lap: { type: Number, default: 1 },
            speed: { type: Number, default: 0 },
            heartRate: { type: Number, default: 70 },
            adrenaline: { type: Number, default: 0 },
            syncLevel: { type: Number, default: 0 },
            status: { type: String, enum: ['En Route', 'Pit', 'Retired', 'Finished'], default: 'En Route' },
            lastUpdated: { type: Date, default: Date.now }
        }],
        winners: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            position: Number, // 1, 2, 3
            time: String
        }],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        // Registration Flow fields
        maxParticipants: { type: Number, default: null }, // null = unlimited
        registrationDeadline: { type: Date, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Race', raceSchema);
