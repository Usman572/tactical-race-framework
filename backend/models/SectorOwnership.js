const mongoose = require('mongoose');

const sectorOwnershipSchema = mongoose.Schema(
    {
        sectorName: { 
            type: String, 
            required: true, 
            unique: true,
            enum: ['Neon District', 'Outlands', 'The Void', 'Cyber City', 'Industrial Zone']
        },
        ownership: [{
            faction: { 
                type: String, 
                enum: ['Cyber Shadows', 'The Vanguard', 'Neon Pulse', 'Void Runners', 'None'],
                default: 'None'
            },
            points: { type: Number, default: 0 }
        }],
        currentOwner: { 
            type: String, 
            enum: ['Cyber Shadows', 'The Vanguard', 'Neon Pulse', 'Void Runners', 'None'],
            default: 'None'
        },
        lastBattleAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

module.exports = mongoose.model('SectorOwnership', sectorOwnershipSchema);
