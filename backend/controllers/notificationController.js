const Notification = require('../models/Notification');
const User = require('../models/User');
const emailService = require('../services/emailService');

// Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { read } = req.query;

    let query = { userId };
    if (read !== undefined) query.read = read === 'true';

    const notifications = await Notification.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification', error: error.message });
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    await Notification.updateMany({ userId, read: false }, { read: true });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notifications', error: error.message });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await Notification.findByIdAndDelete(notificationId);

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
};

// Clear all notifications
exports.clearAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    await Notification.deleteMany({ userId });

    res.json({
      success: true,
      message: 'All notifications cleared',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing notifications', error: error.message });
  }
};

// Send attendance alert to user
exports.sendAttendanceAlert = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notification = await emailService.sendAttendanceAlert(user);

    res.json({
      success: true,
      message: 'Attendance alert sent',
      notification,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending alert', error: error.message });
  }
};

// Broadcast announcement to all users
exports.broadcastAnnouncement = async (req, res) => {
  try {
    const { message, role } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query);
    const notifications = await emailService.broadcastAnnouncement(users, message);

    res.json({
      success: true,
      message: 'Announcement broadcasted',
      sentTo: users.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error broadcasting', error: error.message });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await Notification.countDocuments({ userId, read: false });

    res.json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching count', error: error.message });
  }
};
