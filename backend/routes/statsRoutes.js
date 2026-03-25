const express = require('express');
const router = express.Router();
const { getPlatformSummary, getRaceTrends } = require('../controllers/statsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/summary', protect, admin, getPlatformSummary);
router.get('/trends', protect, admin, getRaceTrends);

module.exports = router;
