/**
 * Chat Model - Represents chat messages and conversation structure
 * This model defines the data structure for chat interactions
 */

export class ChatMessage {
  constructor(id, role, content, timestamp, metadata = {}) {
    this.id = id;
    this.role = role; // 'user' or 'assistant'
    this.content = content;
    this.timestamp = timestamp || new Date().toISOString();
    this.metadata = metadata;
  }

  /**
   * Create a user message
   * @param {string} content - Message content
   * @param {Object} metadata - Additional metadata
   */
  static createUserMessage(content, metadata = {}) {
    return new ChatMessage(
      this.generateId(),
      'user',
      content,
      new Date().toISOString(),
      metadata
    );
  }

  /**
   * Create an assistant message
   * @param {string} content - Message content
   * @param {Object} metadata - Additional metadata
   */
  static createAssistantMessage(content, metadata = {}) {
    return new ChatMessage(
      this.generateId(),
      'assistant',
      content,
      new Date().toISOString(),
      metadata
    );
  }

  /**
   * Generate a unique ID for messages
   */
  static generateId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Convert message to plain object
   */
  toJSON() {
    return {
      id: this.id,
      role: this.role,
      content: this.content,
      timestamp: this.timestamp,
      metadata: this.metadata
    };
  }
}

export class ChatSession {
  constructor(id, userId = null) {
    this.id = id;
    this.userId = userId;
    this.messages = [];
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    this.metadata = {};
  }

  /**
   * Add a message to the chat session
   * @param {ChatMessage} message - Message to add
   */
  addMessage(message) {
    this.messages.push(message);
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Get the last N messages from the session
   * @param {number} count - Number of messages to retrieve
   */
  getLastMessages(count = 10) {
    return this.messages.slice(-count);
  }

  /**
   * Get conversation history as formatted string
   * @param {number} maxMessages - Maximum number of messages to include
   */
  getConversationHistory(maxMessages = 20) {
    const recentMessages = this.getLastMessages(maxMessages);
    return recentMessages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
  }

  /**
   * Create a new chat session
   * @param {string} userId - Optional user ID
   */
  static createSession(userId = null) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return new ChatSession(sessionId, userId);
  }

  /**
   * Convert session to plain object
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      messages: this.messages.map(msg => msg.toJSON()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      metadata: this.metadata
    };
  }
}

// In-memory storage for chat sessions (in production, use a proper database)
const chatSessions = new Map();

/**
 * Chat Session Manager - Handles chat session operations
 */
export class ChatSessionManager {
  /**
   * Create a new chat session
   * @param {string} userId - Optional user ID
   */
  static createSession(userId = null) {
    const session = ChatSession.createSession(userId);
    chatSessions.set(session.id, session);
    return session;
  }

  /**
   * Get a chat session by ID
   * @param {string} sessionId - Session ID
   */
  static getSession(sessionId) {
    return chatSessions.get(sessionId);
  }

  /**
   * Add a message to a session
   * @param {string} sessionId - Session ID
   * @param {ChatMessage} message - Message to add
   */
  static addMessageToSession(sessionId, message) {
    const session = this.getSession(sessionId);
    if (session) {
      session.addMessage(message);
      return session;
    }
    throw new Error(`Session ${sessionId} not found`);
  }

  /**
   * Get all sessions for a user
   * @param {string} userId - User ID
   */
  static getUserSessions(userId) {
    return Array.from(chatSessions.values())
      .filter(session => session.userId === userId);
  }

  /**
   * Delete a chat session
   * @param {string} sessionId - Session ID
   */
  static deleteSession(sessionId) {
    return chatSessions.delete(sessionId);
  }
} 