import mongoose from 'mongoose';

/**
 * Message Schema - Defines the structure for individual chat messages
 */
const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

/**
 * Chat Session Schema - Defines the structure for chat sessions
 */
const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: [messageSchema],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

/**
 * Pre-save middleware to update title based on first user message
 */
chatSessionSchema.pre('save', function(next) {
  if (this.isNew && this.messages.length > 0) {
    const firstUserMessage = this.messages.find(msg => msg.role === 'user');
    if (firstUserMessage) {
      // Use first 50 characters of first user message as title
      this.title = firstUserMessage.content.substring(0, 50) + 
                   (firstUserMessage.content.length > 50 ? '...' : '');
    }
  }
  next();
});

/**
 * Instance method to add a message to the chat session
 */
chatSessionSchema.methods.addMessage = function(role, content, metadata = {}) {
  this.messages.push({
    role,
    content,
    metadata
  });
  return this.save();
};

/**
 * Instance method to get the last N messages
 */
chatSessionSchema.methods.getLastMessages = function(count = 10) {
  return this.messages.slice(-count);
};

/**
 * Instance method to get conversation history as formatted string
 */
chatSessionSchema.methods.getConversationHistory = function(maxMessages = 20) {
  const recentMessages = this.getLastMessages(maxMessages);
  return recentMessages
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');
};

/**
 * Static method to find all sessions for a user
 */
chatSessionSchema.statics.findByUserId = function(userId) {
  return this.find({ userId, isActive: true })
    .sort({ updatedAt: -1 })
    .select('-messages'); // Don't include messages in list view
};

/**
 * Static method to find a session with messages
 */
chatSessionSchema.statics.findSessionWithMessages = function(sessionId, userId) {
  return this.findOne({ _id: sessionId, userId, isActive: true });
};

/**
 * Static method to create a new chat session
 */
chatSessionSchema.statics.createSession = function(userId, title = 'New Chat') {
  return this.create({
    userId,
    title
  });
};

/**
 * Static method to delete a chat session (soft delete)
 */
chatSessionSchema.statics.deleteSession = function(sessionId, userId) {
  return this.findOneAndUpdate(
    { _id: sessionId, userId },
    { isActive: false },
    { new: true }
  );
};

// Create and export the ChatSession model
const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
export default ChatSession; 