const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, sendNotification, deleteNotification, deleteThread } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/multerConfig');

router.get('/', protect, getNotifications);
router.post('/', protect, upload.single('media'), sendNotification);
router.put('/:id', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);
router.delete('/thread/:senderId', protect, deleteThread);

module.exports = router;
