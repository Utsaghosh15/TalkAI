import langChainService from '../services/langchainService.js';
import { ChatMessage, ChatSessionManager } from '../models/Chat.js';

/**
 * Chat Controller - Handles chat-related API requests
 * Manages chat sessions, message processing, and AI responses
 */
class ChatController {
  /**
   * Process a chat message and return AI response
   * POST /api/chat
   */
  async processChatMessage(req, res) {
    try {
      const { message, sessionId, userId } = req.body;

      // Validate required fields
      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Message is required and must be a string'
        });
      }

      // Get or create chat session
      let session;
      if (sessionId) {
        session = ChatSessionManager.getSession(sessionId);
        if (!session) {
          return res.status(404).json({
            success: false,
            error: 'Chat session not found'
          });
        }
      } else {
        session = ChatSessionManager.createSession(userId);
      }

      // Create user message
      const userMessage = ChatMessage.createUserMessage(message);
      ChatSessionManager.addMessageToSession(session.id, userMessage);

      // Get conversation history for context
      const conversationHistory = session.getConversationHistory();

      // Process message with LangChain
      const aiResponse = await langChainService.processChatMessage(
        message,
        conversationHistory
      );

      // Create assistant message
      const assistantMessage = ChatMessage.createAssistantMessage(aiResponse);
      ChatSessionManager.addMessageToSession(session.id, assistantMessage);

      // Return response
      res.json({
        success: true,
        data: {
          sessionId: session.id,
          response: aiResponse,
          messageId: assistantMessage.id,
          timestamp: assistantMessage.timestamp
        }
      });

    } catch (error) {
      console.error('❌ Chat controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process chat message',
        details: error.message
      });
    }
  }

  /**
   * Get chat session history
   * GET /api/chat/session/:sessionId
   */
  async getSessionHistory(req, res) {
    try {
      const { sessionId } = req.params;

      const session = ChatSessionManager.getSession(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Chat session not found'
        });
      }

      res.json({
        success: true,
        data: session.toJSON()
      });

    } catch (error) {
      console.error('❌ Get session history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get session history',
        details: error.message
      });
    }
  }

  /**
   * Get all sessions for a user
   * GET /api/chat/sessions/:userId
   */
  async getUserSessions(req, res) {
    try {
      const { userId } = req.params;

      const sessions = ChatSessionManager.getUserSessions(userId);

      res.json({
        success: true,
        data: sessions.map(session => ({
          id: session.id,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          messageCount: session.messages.length
        }))
      });

    } catch (error) {
      console.error('❌ Get user sessions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user sessions',
        details: error.message
      });
    }
  }

  /**
   * Create a new chat session
   * POST /api/chat/session
   */
  async createSession(req, res) {
    try {
      const { userId } = req.body;

      const session = ChatSessionManager.createSession(userId);

      res.json({
        success: true,
        data: {
          sessionId: session.id,
          createdAt: session.createdAt
        }
      });

    } catch (error) {
      console.error('❌ Create session error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create chat session',
        details: error.message
      });
    }
  }

  /**
   * Delete a chat session
   * DELETE /api/chat/session/:sessionId
   */
  async deleteSession(req, res) {
    try {
      const { sessionId } = req.params;

      const deleted = ChatSessionManager.deleteSession(sessionId);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Chat session not found'
        });
      }

      res.json({
        success: true,
        message: 'Chat session deleted successfully'
      });

    } catch (error) {
      console.error('❌ Delete session error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete chat session',
        details: error.message
      });
    }
  }

  /**
   * Get service status
   * GET /api/chat/status
   */
  async getStatus(req, res) {
    try {
      const status = langChainService.getStatus();

      res.json({
        success: true,
        data: status
      });

    } catch (error) {
      console.error('❌ Get status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get service status',
        details: error.message
      });
    }
  }
}

// Export controller instance
const chatController = new ChatController();
export default chatController; 