// routes/subject.js
const express = require('express');
const {
  createSubject,
  getSubjects,
  getSubject,
  addTopic,
  completeTopic,
  deleteTopic
} = require('../controllers/subjectController');
const auth = require('../middleware/auth');

const router = express.Router();

// Subject routes
router.post('/', auth.protect, createSubject);
router.get('/', auth.protect, getSubjects);
router.get('/:id', auth.protect, getSubject);

// Topic routes
router.post('/:id/topics', auth.protect, addTopic);
router.put('/topics/:id/complete', auth.protect, completeTopic);
router.delete('/topics/:id', auth.protect, deleteTopic);

module.exports = router;
