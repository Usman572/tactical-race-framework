const express = require('express');
const router = express.Router();
const { getDailyMissions } = require('../controllers/missionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDailyMissions);

module.exports = router;
