// routes/attendance.js
const express = require('express');
const router = express.Router();
const { markAttendance, getAttendanceReport } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// POST /api/attendance/mark - Mark attendance (Teacher/Admin only)
router.post('/mark', authorize('teacher', 'admin'), markAttendance);

// GET /api/attendance/report - Get attendance report
router.get('/report', getAttendanceReport);

module.exports = router;