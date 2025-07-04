import User from '../models/User.js';
import emailService from '../services/emailService.js';
import otpService from '../services/otpService.js';
import jwtService from '../services/jwtService.js';
import passportConfig from '../config/passport.js';

/**
 * Authentication Controller - Handles all authentication operations
 */
class AuthController {
  /**
   * Send OTP for email verification
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async sendOTP(req, res) {
    try {
      const { email } = req.body;

      // Validate email
      if (!email || !email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
        return res.status(400).json({
          success: false,
          error: 'Valid email address is required'
        });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.isVerified) {
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists and is verified'
        });
      }

      // Generate and store OTP
      const otp = otpService.generateOTP();
      otpService.storeOTP(email, otp);

      // Send OTP email
      await emailService.sendOTP(email, otp);

      res.json({
        success: true,
        message: 'OTP sent successfully',
        data: {
          email,
          expiresIn: 600 // 10 minutes in seconds
        }
      });
    } catch (error) {
      console.error('❌ Send OTP error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send OTP'
      });
    }
  }

  /**
   * Verify OTP and complete registration
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async verifyOTPAndRegister(req, res) {
    try {
      const { email, otp, password, name } = req.body;

      // Validate input
      if (!email || !otp || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email, OTP, and password are required'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long'
        });
      }

      // Verify OTP
      const verification = otpService.verifyOTP(email, otp);
      if (!verification.valid) {
        return res.status(400).json({
          success: false,
          error: verification.message
        });
      }

      // Check if user already exists
      let user = await User.findByEmail(email);
      
      if (user) {
        // Update existing user
        user.password = password;
        user.isVerified = true;
        user.verificationToken = null;
        if (name) {
          user.profile.name = name;
        }
        await user.save();
      } else {
        // Create new user
        user = new User({
          email,
          password,
          isVerified: true,
          profile: { name: name || '' }
        });
        await user.save();
      }

      // Generate JWT token
      const token = jwtService.generateToken(user);

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(email, user.profile.name || 'User');
      } catch (emailError) {
        console.error('❌ Failed to send welcome email:', emailError);
        // Don't fail the registration if welcome email fails
      }

      res.json({
        success: true,
        message: 'Registration completed successfully',
        data: {
          user: user.getPublicProfile(),
          token
        }
      });
    } catch (error) {
      console.error('❌ Verify OTP and register error:', error);
      
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Registration failed'
      });
    }
  }

  /**
   * Sign in with email and password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async signin(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // Check if user has password (not Google OAuth only)
      if (!user.password) {
        return res.status(401).json({
          success: false,
          error: 'This account uses Google OAuth. Please sign in with Google.'
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // Check if user is verified
      if (!user.isVerified) {
        return res.status(403).json({
          success: false,
          error: 'Email not verified. Please verify your email address.'
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = jwtService.generateToken(user);

      res.json({
        success: true,
        message: 'Sign in successful',
        data: {
          user: user.getPublicProfile(),
          token
        }
      });
    } catch (error) {
      console.error('❌ Sign in error:', error);
      res.status(500).json({
        success: false,
        error: 'Sign in failed'
      });
    }
  }

  /**
   * Get current user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProfile(req, res) {
    try {
      res.json({
        success: true,
        data: {
          user: req.user.getPublicProfile()
        }
      });
    } catch (error) {
      console.error('❌ Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get profile'
      });
    }
  }

  /**
   * Update user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateProfile(req, res) {
    try {
      const { name } = req.body;

      if (name) {
        req.user.profile.name = name;
      }

      await req.user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: req.user.getPublicProfile()
        }
      });
    } catch (error) {
      console.error('❌ Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  }

  /**
   * Change password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'New password must be at least 6 characters long'
        });
      }

      // Check if user has password (not Google OAuth only)
      if (!req.user.password) {
        return res.status(400).json({
          success: false,
          error: 'Password change not available for Google OAuth accounts'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Update password
      req.user.password = newPassword;
      await req.user.save();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('❌ Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to change password'
      });
    }
  }

  /**
   * Request password reset
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not
        return res.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent'
        });
      }

      // Check if user has password (not Google OAuth only)
      if (!user.password) {
        return res.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent'
        });
      }

      // Generate reset token
      const resetToken = jwtService.generateShortToken(
        { userId: user._id, type: 'password-reset' },
        '1h'
      );

      // Save reset token to user
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      // Send reset email
      await emailService.sendPasswordResetEmail(email, resetToken);

      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    } catch (error) {
      console.error('❌ Request password reset error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to request password reset'
      });
    }
  }

  /**
   * Reset password with token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Token and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'New password must be at least 6 characters long'
        });
      }

      // Verify token
      const verification = jwtService.verifyToken(token);
      if (!verification.valid || verification.payload.type !== 'password-reset') {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired reset token'
        });
      }

      // Find user
      const user = await User.findById(verification.payload.userId);
      if (!user || user.resetPasswordToken !== token) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired reset token'
        });
      }

      // Check if token has expired
      if (user.resetPasswordExpires < new Date()) {
        return res.status(400).json({
          success: false,
          error: 'Reset token has expired'
        });
      }

      // Update password and clear reset token
      user.password = newPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('❌ Reset password error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reset password'
      });
    }
  }

  /**
   * Sign out (client-side token removal)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async signout(req, res) {
    try {
      // In a stateless JWT system, the client removes the token
      // We could implement a blacklist here if needed
      res.json({
        success: true,
        message: 'Sign out successful'
      });
    } catch (error) {
      console.error('❌ Sign out error:', error);
      res.status(500).json({
        success: false,
        error: 'Sign out failed'
      });
    }
  }
}

// Export singleton instance
const authController = new AuthController();
export default authController; 