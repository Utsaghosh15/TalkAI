import jwtService from '../services/jwtService.js';
import User from '../models/User.js';

/**
 * Authentication middleware to verify JWT token and extract user info
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify token
    const verification = jwtService.verifyToken(token);
    
    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Get user from database
    const user = await User.findById(verification.payload.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user is verified (optional, depending on your requirements)
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        error: 'Email not verified. Please verify your email address.'
      });
    }

    // Attach user to request object
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (token) {
      const verification = jwtService.verifyToken(token);
      
      if (verification.valid) {
        const user = await User.findById(verification.payload.userId);
        if (user) {
          req.user = user;
          req.token = token;
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('❌ Optional authentication error:', error);
    next(); // Continue without authentication
  }
};

/**
 * Middleware to check if user is verified
 */
export const requireVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      error: 'Email verification required'
    });
  }

  next();
};

/**
 * Middleware to check if user has Google OAuth
 */
export const requireGoogleAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (!req.user.googleId) {
    return res.status(403).json({
      success: false,
      error: 'Google OAuth account required'
    });
  }

  next();
};

/**
 * Middleware to check if user has email/password auth
 */
export const requireEmailAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (req.user.googleId && !req.user.password) {
    return res.status(403).json({
      success: false,
      error: 'Email/password account required'
    });
  }

  next();
};

/**
 * Rate limiting middleware for OTP requests
 */
export const rateLimitOTP = (req, res, next) => {
  // Simple rate limiting - in production, use Redis or similar
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Store rate limit data in memory (in production, use Redis)
  if (!global.otpRateLimit) {
    global.otpRateLimit = new Map();
  }

  const clientData = global.otpRateLimit.get(clientIP) || { count: 0, resetTime: now + (60 * 1000) };
  
  // Reset counter if 1 minute has passed
  if (now > clientData.resetTime) {
    clientData.count = 0;
    clientData.resetTime = now + (60 * 1000);
  }

  // Check if limit exceeded (3 requests per minute)
  if (clientData.count >= 3) {
    return res.status(429).json({
      success: false,
      error: 'Too many OTP requests. Please wait before requesting another OTP.'
    });
  }

  // Increment counter
  clientData.count++;
  global.otpRateLimit.set(clientIP, clientData);

  next();
};

/**
 * Error handling middleware for authentication errors
 */
export const handleAuthError = (error, req, res, next) => {
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired'
    });
  }

  next(error);
}; 