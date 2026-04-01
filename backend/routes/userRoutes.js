const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser, uploadProfilePicture, getLeaderboard } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validationMiddleware');

// Validation rules for user update
const userUpdateValidation = [
    body('role').optional().isIn(['user', 'partner', 'admin']).withMessage('Invalid role'),
    body('faction').optional().isIn(['Cyber Shadows', 'The Vanguard', 'Neon Pulse', 'Void Runners', 'None']).withMessage('Invalid faction'),
    body('profilePicture').optional().isString().trim(),
    validateRequest
];

router.get('/leaderboard', getLeaderboard);
router.get('/', protect, getUsers);
router.post('/upload', protect, upload.single('profilePicture'), uploadProfilePicture);
router.get('/:id', getUserById);
router.patch('/:id', protect, userUpdateValidation, updateUser);
router.delete('/:id', protect, deleteUser);

module.exports = router;
