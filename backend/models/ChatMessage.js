const mongoose = require('mongoose');

const chatMessageSchema = mongoose.Schema(
    {
        race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race', required: false },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
        faction: { 
            type: String, 
            enum: ['Cyber Shadows', 'The Vanguard', 'Neon Pulse', 'Void Runners', 'None'],
            required: false 
        },
        isTacticalBroadcast: { type: Boolean, default: false },
        isHighPriority: { type: Boolean, default: false },
        decryptedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        text: { type: String, required: true },
        isEncrypted: { type: Boolean, default: true },
        messageType: { type: String, enum: ['Standard', 'Tactical', 'System'], default: 'Standard' },
        type: { type: String, enum: ['Message', 'Image', 'Video', 'Audio'], default: 'Message' },
        mediaUrl: { type: String },
        read: { type: Boolean, default: false },
        timestamp: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
