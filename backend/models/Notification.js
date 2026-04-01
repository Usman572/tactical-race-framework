const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
    {
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for system notifications
        race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race' },
        joinRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'JoinRequest' },
        type: { type: String, enum: ['Message', 'JoinRequest', 'Alert', 'Achievement', 'Image', 'Video', 'Audio'], default: 'Message' },
        message: { type: String, required: true },
        mediaUrl: { type: String },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
