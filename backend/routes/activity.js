// routes/activity.js
const express = require('express');
const router = express.Router();
const { addActivity, getAllActivities, deleteActivity } = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// POST /api/activity/add - Add activity
router.post('/add', addActivity);

// GET /api/activity/all - Get all activities
router.get('/all', getAllActivities);

// DELETE /api/activity/:id - Delete activity (Teacher/Admin only)
router.delete('/:id', authorize('teacher', 'admin'), deleteActivity);

module.exports = router;