// routes/student.js
const express = require('express');
const {
  addStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.post('/', auth.protect, addStudent);
router.get('/', auth.protect, getStudents);
router.get('/:id', auth.protect, getStudent);
router.put('/:id', auth.protect, updateStudent);
router.delete('/:id', auth.protect, deleteStudent);

module.exports = router;
