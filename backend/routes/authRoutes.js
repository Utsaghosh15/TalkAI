import express from 'express';
import passport from 'passport';
import authController from '../controllers/authController.js';
import { authenticateToken, rateLimitOTP } from '../middleware/auth.js';
import passportConfig from '../config/passport.js';

const router = express.Router();

/**
 * Authentication Routes
 */

// OTP Routes
router.post('/send-otp', rateLimitOTP, authController.sendOTP.bind(authController));
router.post('/verify-otp-register', authController.verifyOTPAndRegister.bind(authController));

// Email/Password Authentication
router.post('/signin', authController.signin.bind(authController));
router.post('/signout', authenticateToken, authController.signout.bind(authController));

// Password Management
router.post('/request-password-reset', authController.requestPasswordReset.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/auth/google/failure' }),
  (req, res) => {
    // Handle successful Google OAuth
    passportConfig.handleOAuthSuccess(req, res, req.user);
  }
);

router.get('/google/failure', (req, res) => {
  passportConfig.handleOAuthFailure(req, res, new Error('Google OAuth failed'));
});

// Protected Routes (require authentication)
router.get('/profile', authenticateToken, authController.getProfile.bind(authController));
router.put('/profile', authenticateToken, authController.updateProfile.bind(authController));
router.post('/change-password', authenticateToken, authController.changePassword.bind(authController));

export default router; 