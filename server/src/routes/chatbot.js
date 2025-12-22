const express = require('express');
const router = express.Router();
const { handleChat, getChatLogs } = require('../controllers/chatbotController');
const { optionalAuth, auth, authorize } = require('../middleware/auth');

// Optional auth - anyone can chat, but if logged in, user info is available
// This allows us to get userId from req.user if token is present
router.post('/chat', optionalAuth, handleChat);

// Admin only - view chat logs
router.get('/logs', auth, authorize('admin'), getChatLogs);

module.exports = router;

