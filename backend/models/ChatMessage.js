const mongoose = require('mongoose');

const chatMessageSchema = mongoose.Schema(
    {
        race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
