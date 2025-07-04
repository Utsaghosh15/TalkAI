import ChatSession from '../models/ChatMongo.js';
import langChainService from '../services/langchainService.js';

/**
 * MongoDB Chat Controller - Handles chat operations with MongoDB storage
 */
class ChatControllerMongo {
  /**
   * Create a new chat session
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createSession(req, res) {
    try {
      const { title } = req.body;
      const userId = req.user._id;

      const session = await ChatSession.createSession(userId, title);

      res.json({
        success: true,
        message: 'Chat session created successfully',
        data: {
          session: {
            id: session._id,
            title: session.title,
            userId: session.userId,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt
          }
        }
      });
    } catch (error) {
      console.error('❌ Create session error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create chat session'
      });
    }
  }

  /**
   * Get all chat sessions for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserSessions(req, res) {
    try {
      const userId = req.user._id;
      const sessions = await ChatSession.findByUserId(userId);

      res.json({
        success: true,
        data: {
          sessions: sessions.map(session => ({
            id: session._id,
            title: session.title,
            userId: session.userId,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
            messageCount: session.messages ? session.messages.length : 0
          }))
        }
      });
    } catch (error) {
      console.error('❌ Get user sessions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get chat sessions'
      });
    }
  }

  /**
   * Get a specific chat session with messages
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSession(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user._id;

      const session = await ChatSession.findSessionWithMessages(sessionId, userId);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Chat session not found'
        });
      }

      res.json({
        success: true,
        data: {
          session: {
            id: session._id,
            title: session.title,
            userId: session.userId,
            messages: session.messages,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt
          }
        }
      });
    } catch (error) {
      console.error('❌ Get session error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get chat session'
      });
    }
  }

  /**
   * Send a message and get AI response
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async sendMessage(req, res) {
    try {
      const { sessionId, message } = req.body;
      const userId = req.user._id;

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Message content is required'
        });
      }

      // Get or create session
      let session;
      if (sessionId) {
        session = await ChatSession.findSessionWithMessages(sessionId, userId);
        if (!session) {
          return res.status(404).json({
            success: false,
            error: 'Chat session not found'
          });
        }
      } else {
        // Create new session if no sessionId provided
        session = await ChatSession.createSession(userId, 'New Chat');
      }

      // Add user message to session
      await session.addMessage('user', message.trim());

      // Get conversation history for AI
      const conversationHistory = session.getConversationHistory();

      // Get AI response using vector database (placeholder)
      const aiResponse = await this.getAIResponse(conversationHistory, message);

      // Add AI response to session
      await session.addMessage('assistant', aiResponse);

      // Update session title if it's the first message
      if (session.messages.length === 2) { // User message + AI response
        const firstUserMessage = session.messages.find(msg => msg.role === 'user');
        if (firstUserMessage) {
          session.title = firstUserMessage.content.substring(0, 50) + 
                         (firstUserMessage.content.length > 50 ? '...' : '');
          await session.save();
        }
      }

      res.json({
        success: true,
        message: 'Message sent successfully',
        data: {
          session: {
            id: session._id,
            title: session.title,
            userId: session.userId,
            updatedAt: session.updatedAt
          },
          messages: session.messages.slice(-2) // Return last 2 messages (user + AI)
        }
      });
    } catch (error) {
      console.error('❌ Send message error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send message'
      });
    }
  }

  /**
   * Delete a chat session
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteSession(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user._id;

      const deletedSession = await ChatSession.deleteSession(sessionId, userId);
      
      if (!deletedSession) {
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
        error: 'Failed to delete chat session'
      });
    }
  }

  /**
   * Update session title
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateSessionTitle(req, res) {
    try {
      const { sessionId } = req.params;
      const { title } = req.body;
      const userId = req.user._id;

      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Title is required'
        });
      }

      const session = await ChatSession.findOneAndUpdate(
        { _id: sessionId, userId, isActive: true },
        { title: title.trim() },
        { new: true }
      );

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Chat session not found'
        });
      }

      res.json({
        success: true,
        message: 'Session title updated successfully',
        data: {
          session: {
            id: session._id,
            title: session.title,
            userId: session.userId,
            updatedAt: session.updatedAt
          }
        }
      });
    } catch (error) {
      console.error('❌ Update session title error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update session title'
      });
    }
  }

  /**
   * Get AI response using vector database (placeholder implementation)
   * @param {string} conversationHistory - Previous conversation context
   * @param {string} userMessage - Current user message
   */
  async getAIResponse(conversationHistory, userMessage) {
    try {
      // This is a placeholder for vector database integration
      // In a real implementation, you would:
      // 1. Convert user message to embedding
      // 2. Search vector database for relevant context
      // 3. Use LangChain to generate response with context
      
      // For now, return a simple response
      const responses = [
        "I understand your question. Let me help you with that.",
        "That's an interesting point. Here's what I think about it.",
        "Based on the context, I can provide you with some insights.",
        "I'd be happy to help you with that. Let me break it down for you.",
        "That's a great question. Here's my perspective on the matter."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return randomResponse + " This is a placeholder response. In the full implementation, this would use a vector database to provide relevant and contextual answers based on your question and conversation history.";
    } catch (error) {
      console.error('❌ AI response generation error:', error);
      return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
    }
  }

  /**
   * Get chat statistics for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getChatStats(req, res) {
    try {
      const userId = req.user._id;

      // Get all active sessions for the user
      const sessions = await ChatSession.find({ userId, isActive: true });
      
      // Calculate statistics
      const totalSessions = sessions.length;
      const totalMessages = sessions.reduce((sum, session) => sum + session.messages.length, 0);
      const averageMessagesPerSession = totalSessions > 0 ? (totalMessages / totalSessions).toFixed(1) : 0;
      
      // Get recent activity (sessions created in last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentSessions = sessions.filter(session => session.createdAt > sevenDaysAgo);

      res.json({
        success: true,
        data: {
          stats: {
            totalSessions,
            totalMessages,
            averageMessagesPerSession: parseFloat(averageMessagesPerSession),
            recentSessions: recentSessions.length,
            lastActivity: sessions.length > 0 ? Math.max(...sessions.map(s => s.updatedAt)) : null
          }
        }
      });
    } catch (error) {
      console.error('❌ Get chat stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get chat statistics'
      });
    }
  }
}

// Export singleton instance
const chatControllerMongo = new ChatControllerMongo();
export default chatControllerMongo; 