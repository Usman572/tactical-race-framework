const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { registerUser, loginUser } = require('../controllers/authController');
const { validateRequest } = require('../middleware/validationMiddleware');
const rateLimit = require('express-rate-limit');

// Strict rate limiter for auth routes to prevent credential stuffing/brute force
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 auth requests per window
    message: { message: 'Too many authentication attempts, please try again after 15 minutes' }
});

// Validation rules for registration
const registerValidation = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .trim().escape(),
    body('email')
        .isEmail().withMessage('Enter a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/\d/).withMessage('Password must contain at least one number')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
    validateRequest
];

// Validation rules for login
const loginValidation = [
    body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest
];

router.post('/register', authLimiter, registerValidation, registerUser);
router.post('/login', authLimiter, loginValidation, loginUser);

module.exports = router;
