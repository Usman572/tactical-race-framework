const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser, uploadProfilePicture, getLeaderboard } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/leaderboard', getLeaderboard);
router.get('/', protect, getUsers);
router.post('/upload', protect, upload.single('profilePicture'), uploadProfilePicture);
router.get('/:id', getUserById);
router.patch('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);

module.exports = router;
