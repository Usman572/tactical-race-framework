const express = require('express');
const router = express.Router();
const { getPartnerStats } = require('../controllers/partnerController');
const { protect } = require('../middleware/authMiddleware');

const partnerOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'partner' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a partner' });
    }
};

router.get('/stats', protect, partnerOrAdmin, getPartnerStats);

module.exports = router;
