const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

// Strict rate limiter for auth routes to prevent credential stuffing/brute force
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 auth requests per window
    message: { message: 'Too many authentication attempts, please try again after 15 minutes' }
});

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);

module.exports = router;
