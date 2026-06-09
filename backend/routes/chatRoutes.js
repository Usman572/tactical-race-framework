const express = require('express');
const router = express.Router();
const { 
    getRaceChat, 
    sendRaceMessage, 
    getPrivateChat, 
    sendPrivateMessage,
    getFactionChat,
    sendFactionMessage,
    getTacticalBroadcasts,
    sendTacticalBroadcast,
    decryptMessage
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/multerConfig');

// Faction Chat
router.get('/faction', protect, getFactionChat);
router.post('/faction', protect, sendFactionMessage);

// Tactical Broadcasts
router.get('/broadcasts', protect, getTacticalBroadcasts);
router.post('/broadcasts', protect, sendTacticalBroadcast);

// Decryption
router.post('/decrypt/:messageId', protect, decryptMessage);

// Private Chat
router.get('/private/:otherUserId', protect, getPrivateChat);
router.post('/private', protect, upload.single('media'), sendPrivateMessage);

// Race Chat
router.get('/:raceId', protect, getRaceChat);
router.post('/:raceId', protect, sendRaceMessage);

module.exports = router;
