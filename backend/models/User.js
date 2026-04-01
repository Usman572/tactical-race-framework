const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        slug: { type: String, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['user', 'partner', 'admin'], default: 'user' },
        profilePicture: { type: String, default: '' },
        rank: { type: String, default: 'Rookie' },
        achievements: [{
            id: String,
            name: String,
            unlockedAt: { type: Date, default: Date.now }
        }],
        stats: {
            wins: { type: Number, default: 0 },
            racesJoined: { type: Number, default: 0 },
            messagesSent: { type: Number, default: 0 },
            points: { type: Number, default: 0 }
        },
        xp: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        faction: { 
            type: String, 
            enum: ['Cyber Shadows', 'The Vanguard', 'Neon Pulse', 'Void Runners', 'None'], 
            default: 'None' 
        },
        dailyMissions: [{
            id: String,
            title: String,
            description: String,
            xpReward: Number,
            targetValue: Number,
            currentValue: { type: Number, default: 0 },
            isCompleted: { type: Boolean, default: false },
            expiresAt: Date
        }],
        dailyXP: { type: Number, default: 0 },
        lastXPUpdate: { type: Date, default: Date.now },
        failedLoginAttempts: { type: Number, default: 0 },
        lockUntil: { type: Date }
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
