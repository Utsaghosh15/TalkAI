import express from 'express';
import chatController from '../controllers/chatController.js';

const router = express.Router();

/**
 * Chat Routes - Define API endpoints for chat functionality
 * All routes are prefixed with /api/chat
 */

// POST /api/chat - Process a chat message and return AI response
router.post('/', chatController.processChatMessage);

// GET /api/chat/status - Get service status
router.get('/status', chatController.getStatus);

// POST /api/chat/session - Create a new chat session
router.post('/session', chatController.createSession);

// GET /api/chat/session/:sessionId - Get chat session history
router.get('/session/:sessionId', chatController.getSessionHistory);

// DELETE /api/chat/session/:sessionId - Delete a chat session
router.delete('/session/:sessionId', chatController.deleteSession);

// GET /api/chat/sessions/:userId - Get all sessions for a user
router.get('/sessions/:userId', chatController.getUserSessions);

export default router; 