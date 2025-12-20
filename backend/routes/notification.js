const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Get user notifications
router.get('/:userId', auth, notificationController.getNotifications);

// Get unread count
router.get('/:userId/unread', auth, notificationController.getUnreadCount);

// Mark as read
router.put('/:notificationId/read', auth, notificationController.markAsRead);

// Mark all as read
router.put('/:userId/read-all', auth, notificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', auth, notificationController.deleteNotification);

// Clear all
router.delete('/:userId/clear-all', auth, notificationController.clearAllNotifications);

// Send attendance alert
router.post('/:userId/send-attendance-alert', auth, notificationController.sendAttendanceAlert);

// Broadcast announcement
router.post('/broadcast/announcement', auth, notificationController.broadcastAnnouncement);

module.exports = router;
