const { validationResult } = require('express-validator');

// Standardized middleware to check for validation errors and return a 400 response
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false,
            message: 'Validation failed',
            errors: errors.array() 
        });
    }
    next();
};

module.exports = { validateRequest };
