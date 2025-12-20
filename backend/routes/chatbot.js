// routes/chatbot.js
const express = require('express');
const {
  sendMessage,
  getSuggestions
} = require('../controllers/chatbotController');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/chatbot/message - Send message and get response
router.post('/message', auth.protect, sendMessage);

// GET /api/chatbot/suggestions/:role - Get role-based suggestions
router.get('/suggestions/:role', auth.protect, getSuggestions);

module.exports = router;
