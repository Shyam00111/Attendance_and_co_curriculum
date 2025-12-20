const express = require('express');
const {
  addSubjectToStudent,
  removeSubjectFromStudent,
  getStudentSubjects,
  bulkAddSubjects
} = require('../controllers/enrollmentController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/add-subject', auth.protect, addSubjectToStudent);
router.post('/remove-subject', auth.protect, removeSubjectFromStudent);
router.get('/student/:studentId', auth.protect, getStudentSubjects);
router.post('/bulk-add', auth.protect, bulkAddSubjects);

module.exports = router;
