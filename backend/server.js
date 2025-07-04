import app from './app.js';
import databaseConfig from './config/database.js';
import mongodbConfig from './config/mongodb.js';
import langChainService from './services/langchainService.js';
import emailService from './services/emailService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Server Startup Script - Initializes services and starts the Express server
 * Handles graceful startup and shutdown of all application components
 */

const PORT = process.env.PORT || 3000;

/**
 * Initialize all application services
 */
async function initializeServices() {
  try {
    console.log('🚀 Initializing TalkAI Backend Services...');
    
    // Initialize MongoDB
    console.log('🗄️ Initializing MongoDB...');
    await mongodbConfig.initialize();
    
    // Initialize vector database
    console.log('📊 Initializing Chroma vector database...');
    await databaseConfig.initialize();
    
    // Initialize LangChain service
    console.log('🤖 Initializing LangChain service...');
    await langChainService.initialize();
    
    // Initialize email service
    console.log('📧 Initializing email service...');
    emailService.initialize();
    
    console.log('✅ All services initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
}

/**
 * Start the Express server
 */
async function startServer() {
  try {
    // Initialize all services first
    await initializeServices();
    
    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`
🎉 TalkAI Backend Server Started Successfully!

📍 Server running on: http://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🗄️ Database: MongoDB (${process.env.MONGO_URI || 'mongodb://localhost:27017/talkai'})
📊 Vector DB: Chroma (${process.env.CHROMA_DB_PATH || './chroma_db'})
🤖 AI Model: GPT-3.5-turbo
📧 Email: ${emailService.isInitialized ? 'Configured' : 'Not configured'}
⏰ Started at: ${new Date().toISOString()}

📋 Available Endpoints:
   GET  /                    - API information
   GET  /health              - Health check
   
🔐 Authentication Endpoints:
   POST /auth/send-otp       - Send OTP for email verification
   POST /auth/verify-otp-register - Verify OTP and complete registration
   POST /auth/signin         - Sign in with email/password
   POST /auth/signout        - Sign out
   GET  /auth/google         - Google OAuth signin
   GET  /auth/profile        - Get user profile (protected)
   PUT  /auth/profile        - Update user profile (protected)
   POST /auth/change-password - Change password (protected)
   POST /auth/request-password-reset - Request password reset
   POST /auth/reset-password - Reset password with token
   
💬 Chat Endpoints (Legacy - In-memory):
   POST /api/chat            - Process chat message
   GET  /api/chat/status     - Service status
   POST /api/chat/session    - Create chat session
   GET  /api/chat/session/:id - Get session history
   DEL  /api/chat/session/:id - Delete session
   GET  /api/chat/sessions/:userId - Get user sessions
   
💬 Chat Endpoints (MongoDB - Protected):
   POST /api/chat-mongo/session - Create chat session
   GET  /api/chat-mongo/sessions - Get user sessions
   GET  /api/chat-mongo/session/:id - Get session with messages
   PUT  /api/chat-mongo/session/:id/title - Update session title
   DEL  /api/chat-mongo/session/:id - Delete session
   POST /api/chat-mongo/message - Send message and get AI response
   GET  /api/chat-mongo/stats - Get chat statistics

🚀 Ready to handle requests!
      `);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('✅ HTTP server closed');
        
        try {
          // Close MongoDB connection
          await mongodbConfig.closeConnection();
          console.log('✅ MongoDB connection closed');
        } catch (error) {
          console.error('❌ Error closing MongoDB connection:', error);
        }
        
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Listen for shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
startServer(); 