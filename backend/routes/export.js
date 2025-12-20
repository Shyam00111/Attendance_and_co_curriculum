const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const auth = require('../middleware/auth');

// Export attendance as Excel
router.get('/attendance/excel', auth.protect, exportController.exportAttendanceExcel);

// Export activity as Excel
router.get('/activity/excel', auth.protect, exportController.exportActivityExcel);

// Export attendance as PDF
router.get('/attendance/pdf', auth.protect, exportController.exportAttendancePDF);

module.exports = router;
