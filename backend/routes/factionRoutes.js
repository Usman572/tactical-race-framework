const express = require('express');
const router = express.Router();
const { getTerritories, getFactionStats } = require('../controllers/factionController');

router.get('/territories', getTerritories);
router.get('/stats', getFactionStats);

module.exports = router;
