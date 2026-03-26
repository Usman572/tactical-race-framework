const express = require('express');
const router = express.Router();
const { getActiveEvents, createEvent, deactivateEvent } = require('../controllers/eventController');
const { protect, admin } = require('../middleware/authMiddleware');

// Operative access
router.get('/', protect, getActiveEvents);

// Admin access
router.post('/', protect, admin, createEvent);
router.put('/:id', protect, admin, deactivateEvent);

module.exports = router;
