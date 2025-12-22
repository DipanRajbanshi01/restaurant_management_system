const express = require('express');
const router = express.Router();
const {
  getSupportChats,
  getUserSupportChat,
  getSupportChatById,
  sendUserMessage,
  sendAdminMessage,
  assignAdmin,
  resolveChat,
} = require('../controllers/supportChatController');
const { auth, authorize } = require('../middleware/auth');

// Admin routes
router.get('/chats', auth, authorize('admin'), getSupportChats);
router.get('/chat/:chatId', auth, getSupportChatById);
router.post('/chat/:chatId/message', auth, authorize('admin'), sendAdminMessage);
router.put('/chat/:chatId/assign', auth, authorize('admin'), assignAdmin);
router.put('/chat/:chatId/resolve', auth, authorize('admin'), resolveChat);

// User routes
router.get('/chat', auth, getUserSupportChat);
router.post('/chat/message', auth, sendUserMessage);

module.exports = router;

