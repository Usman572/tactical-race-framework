const mongoose = require('mongoose');

const joinRequestSchema = mongoose.Schema(
    {
        race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('JoinRequest', joinRequestSchema);
