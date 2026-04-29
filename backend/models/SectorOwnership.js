const mongoose = require('mongoose');

const sectorOwnershipSchema = new mongoose.Schema({
    sectorName: {
        type: String,
        required: true,
        unique: true
    },
    currentOwner: {
        type: String,
        enum: ['Cyber Shadows', 'The Vanguard', 'Neon Pulse', 'Void Runners', 'None'],
        default: 'None'
    },
    influencePoints: {
        type: Number,
        default: 0
    },
    // GeoJSON style coordinates for the map boundary
    boundary: {
        type: [[Number]], // Array of [lat, lon] points
        required: true
    },
    lastContested: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('SectorOwnership', sectorOwnershipSchema);
