const express = require('express');
const router = express.Router();
const { getRaceChat, sendRaceMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:raceId', protect, getRaceChat);
router.post('/:raceId', protect, sendRaceMessage);

module.exports = router;
