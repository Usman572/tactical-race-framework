const mongoose = require('mongoose');

const globalEventSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        type: { 
            type: String, 
            enum: ['XP_BOOST', 'SCRAMBLE', 'OBJECTIVE', 'MAINTENANCE'], 
            default: 'OBJECTIVE' 
        },
        multiplier: { type: Number, default: 1 }, // For XP_BOOST
        startTime: { type: Date, default: Date.now },
        endTime: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
        id: { type: String, unique: true, required: true } // Tactical Slug, e.g., 'neon-pulse-2026'
    },
    { timestamps: true }
);

module.exports = mongoose.model('GlobalEvent', globalEventSchema);
