// server/routes/chatbotRoutes.js
import express from 'express';
import { chatWithBot, getQuickPrice, getTrustScore } from '../controllers/chatbotController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', protect, chatWithBot);
router.get('/price', getQuickPrice);
router.get('/trust/:userId', getTrustScore);

export default router;