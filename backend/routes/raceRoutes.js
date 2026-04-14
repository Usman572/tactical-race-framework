const express = require('express');
const router = express.Router();
const { 
    getRaces, 
    getRaceById,
    createRace, 
    updateRace, 
    deleteRace, 
    joinRace, 
    leaveRace, 
    searchAll, 
    requestToJoin, 
    approveJoinRequest, 
    rejectJoinRequest,
    getPendingRequests,
    getMyRequests,
    checkIn,
    startCountdown,
    completeRace,
    updateTelemetry,
    handleRaceCommand
} = require('../controllers/raceController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validationMiddleware');

// Specific limiter for join requests (preventing spam)
const joinRequestLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 join requests per window
    message: { message: 'Too many join requests from this IP, please try again later.' }
});

// Validation rules for race creation/update
const raceValidation = [
    body('name').notEmpty().withMessage('Name is required').trim().escape(),
    body('location').notEmpty().withMessage('Location is required').trim().escape(),
    body('date').isISO8601().withMessage('Date must be a valid ISO8601 string'),
    body('type').optional().isString().trim().escape(),
    body('maxParticipants').optional().isInt({ min: 1 }).withMessage('Max participants must be at least 1'),
    body('registrationDeadline').optional().isISO8601().withMessage('Deadline must be a valid ISO8601 string'),
    validateRequest
];

// Validation for join requests
const joinRequestValidation = [
    body('message').optional().isString().isLength({ max: 500 }).withMessage('Message is too long').trim().escape(),
    body('vehicleDetails').optional().isString().trim().escape(),
    body('experience').optional().isString().trim().escape(),
    validateRequest
];

router.get('/search', searchAll);

// Optional auth: attaches req.user if token present, but doesn't block if missing
const softProtect = (req, res, next) => {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
        return protect(req, res, next);
    }
    next();
};

router.get('/', getRaces);
router.get('/:id', getRaceById);
router.post('/', softProtect, raceValidation, createRace);      // public, but captures createdBy if logged in
router.put('/:id', protect, raceValidation, updateRace);
router.delete('/:id', protect, deleteRace);
router.post('/:id/join', protect, joinRace);
router.post('/:id/leave', protect, leaveRace);

// Join Requests
router.get('/requests/pending', protect, getPendingRequests);
router.get('/requests/my', protect, getMyRequests);
router.post('/:id/request', protect, joinRequestLimiter, joinRequestValidation, requestToJoin);
router.patch('/requests/:id/approve', protect, approveJoinRequest);
router.patch('/requests/:id/reject', protect, rejectJoinRequest);

// Tactical HUD
router.post('/:id/checkin', protect, checkIn);
router.post('/:id/start-countdown', protect, startCountdown);
router.post('/:id/complete', protect, completeRace);
router.post('/:id/telemetry', protect, updateTelemetry);
router.post('/:id/command', protect, handleRaceCommand);

module.exports = router;
