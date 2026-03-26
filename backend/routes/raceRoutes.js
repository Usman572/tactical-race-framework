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
    completeRace
} = require('../controllers/raceController');
const { protect } = require('../middleware/authMiddleware');

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
router.post('/', softProtect, createRace);      // public, but captures createdBy if logged in
router.put('/:id', protect, updateRace);
router.delete('/:id', protect, deleteRace);
router.post('/:id/join', protect, joinRace);
router.post('/:id/leave', protect, leaveRace);

// Join Requests
router.get('/requests/pending', protect, getPendingRequests);
router.get('/requests/my', protect, getMyRequests);
router.post('/:id/request', protect, requestToJoin);
router.patch('/requests/:id/approve', protect, approveJoinRequest);
router.patch('/requests/:id/reject', protect, rejectJoinRequest);

// Tactical HUD
router.post('/:id/checkin', protect, checkIn);
router.post('/:id/start-countdown', protect, startCountdown);
router.post('/:id/complete', protect, completeRace);

module.exports = router;
