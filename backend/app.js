import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes.js';
import chatRoutesMongo from './routes/chatRoutesMongo.js';
import authRoutes from './routes/authRoutes.js';
import mongodbConfig from './config/mongodb.js';
import passportConfig from './config/passport.js';
import emailService from './services/emailService.js';
import { handleAuthError } from './middleware/auth.js';

// Load environment variables
dotenv.config();

/**
 * Express App Setup - Main application configuration
 * Handles middleware setup, route registration, and error handling
 */
const app = express();

// Middleware Configuration
// Parse JSON bodies
app.use(bodyParser.json({ limit: '30mb' }));

// Parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// CORS Configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Session Configuration (for Passport)
app.use(cookieSession({
  name: 'talkai-session',
  keys: [process.env.SESSION_SECRET || 'default-secret-key'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Initialize Passport
passportConfig.initialize();
app.use(passportConfig.getPassport().initialize());
app.use(passportConfig.getPassport().session());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      mongodb: mongodbConfig.getConnectionStatus(),
      email: emailService.isInitialized
    }
  });
});

// API Routes
// Mount authentication routes under /auth
app.use('/auth', authRoutes);

// Mount chat routes under /api/chat (legacy - in-memory)
app.use('/api/chat', chatRoutes);

// Mount MongoDB chat routes under /api/chat-mongo
app.use('/api/chat-mongo', chatRoutesMongo);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'TalkAI Backend API',
    version: '1.0.0',
    features: {
      authentication: 'Email/Password + Google OAuth',
      chat: 'MongoDB-based chat system',
      vectorDatabase: 'Chroma integration',
      email: 'OTP and notification emails'
    },
    endpoints: {
      health: '/health',
      auth: {
        signup: 'POST /auth/send-otp, POST /auth/verify-otp-register',
        signin: 'POST /auth/signin',
        google: 'GET /auth/google',
        profile: 'GET /auth/profile'
      },
      chat: {
        legacy: '/api/chat',
        mongo: '/api/chat-mongo'
      }
    }
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Authentication error handler
app.use(handleAuthError);

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

export default app; 