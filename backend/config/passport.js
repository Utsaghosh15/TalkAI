import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import jwtService from '../services/jwtService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Passport Configuration - Google OAuth 2.0 Strategy
 */
class PassportConfig {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Initialize Passport configuration
   */
  initialize() {
    try {
      // Configure Google OAuth 2.0 strategy
      passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
        scope: ['profile', 'email']
      }, async (accessToken, refreshToken, profile, done) => {
        try {
          // Find or create user
          const user = await User.findOrCreateGoogleUser(profile);
          return done(null, user);
        } catch (error) {
          console.error('❌ Google OAuth error:', error);
          return done(error, null);
        }
      }));

      // Serialize user for session
      passport.serializeUser((user, done) => {
        done(null, user.id);
      });

      // Deserialize user from session
      passport.deserializeUser(async (id, done) => {
        try {
          const user = await User.findById(id);
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      });

      this.isInitialized = true;
      console.log('✅ Passport configuration initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Passport configuration:', error);
      throw error;
    }
  }

  /**
   * Get Passport instance
   */
  getPassport() {
    if (!this.isInitialized) {
      throw new Error('Passport not initialized. Call initialize() first.');
    }
    return passport;
  }

  /**
   * Generate JWT token after successful OAuth authentication
   * @param {Object} user - User object
   */
  generateAuthToken(user) {
    return jwtService.generateToken(user);
  }

  /**
   * Handle successful OAuth authentication
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Object} user - User object
   */
  handleOAuthSuccess(req, res, user) {
    try {
      const token = this.generateAuthToken(user);
      
      // Return success response with token
      res.json({
        success: true,
        message: 'Google OAuth authentication successful',
        data: {
          user: user.getPublicProfile(),
          token
        }
      });
    } catch (error) {
      console.error('❌ OAuth success handler error:', error);
      res.status(500).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  }

  /**
   * Handle OAuth authentication failure
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Error} error - Error object
   */
  handleOAuthFailure(req, res, error) {
    console.error('❌ OAuth authentication failed:', error);
    
    res.status(401).json({
      success: false,
      error: 'Google OAuth authentication failed'
    });
  }
}

// Export singleton instance
const passportConfig = new PassportConfig();
export default passportConfig; 