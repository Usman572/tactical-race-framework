const mongoose = require('mongoose');

const joinRequestSchema = mongoose.Schema(
    {
        race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
        // Enriched registration fields
        message: { type: String, default: '' },
        vehicleDetails: { type: String, default: '' },
        experience: { type: String, enum: ['Rookie', 'Veteran', 'Elite'], default: 'Rookie' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('JoinRequest', joinRequestSchema);
