const express = require('express');
const router = express.Router();
const { getRaceChat, sendRaceMessage, getPrivateChat, sendPrivateMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// Private Chat
router.get('/private/:otherUserId', protect, getPrivateChat);
router.post('/private', protect, sendPrivateMessage);

// Race Chat
router.get('/:raceId', protect, getRaceChat);
router.post('/:raceId', protect, sendRaceMessage);

module.exports = router;
