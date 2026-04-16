const mongoose = require('mongoose');

const chatMessageSchema = mongoose.Schema(
    {
        race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race', required: false },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
        text: { type: String, required: true },
        isEncrypted: { type: Boolean, default: true },
        messageType: { type: String, enum: ['Standard', 'Tactical', 'System'], default: 'Standard' },
        timestamp: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
