const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  getOrCreateChat,
  getUserChats,
  getChatById,
  sendMessage,
  archiveChat
} = require('../controllers/chatController');

// All routes require authentication
router.use(protect);

// Get or create chat
router.post('/create', getOrCreateChat);

// Get all chats for user
router.get('/', getUserChats);

// Get single chat by ID
router.get('/:chatId', getChatById);

// Send message
router.post('/:chatId/message', sendMessage);

// Archive chat
router.put('/:chatId/archive', archiveChat);

module.exports = router;
