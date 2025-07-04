import express from 'express';
import chatControllerMongo from '../controllers/chatControllerMongo.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * MongoDB Chat Routes - All routes require authentication
 */

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Chat Session Management
router.post('/session', chatControllerMongo.createSession.bind(chatControllerMongo));
router.get('/sessions', chatControllerMongo.getUserSessions.bind(chatControllerMongo));
router.get('/session/:sessionId', chatControllerMongo.getSession.bind(chatControllerMongo));
router.put('/session/:sessionId/title', chatControllerMongo.updateSessionTitle.bind(chatControllerMongo));
router.delete('/session/:sessionId', chatControllerMongo.deleteSession.bind(chatControllerMongo));

// Chat Messages
router.post('/message', chatControllerMongo.sendMessage.bind(chatControllerMongo));

// Chat Statistics
router.get('/stats', chatControllerMongo.getChatStats.bind(chatControllerMongo));

export default router; 