import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Email Service - Handles email sending using Nodemailer
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.isInitialized = false;
  }

  /**
   * Initialize email transporter
   */
  initialize() {
    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      this.isInitialized = true;
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      throw error;
    }
  }

  /**
   * Send OTP email
   * @param {string} email - Recipient email
   * @param {string} otp - 6-digit OTP
   */
  async sendOTP(email, otp) {
    if (!this.isInitialized) {
      throw new Error('Email service not initialized');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'TalkAI - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">TalkAI</h1>
            <p style="color: white; margin: 10px 0 0 0;">Email Verification</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Thank you for signing up with TalkAI! To complete your registration, 
              please use the following verification code:
            </p>
            
            <div style="background: white; border: 2px solid #667eea; border-radius: 10px; 
                        padding: 20px; text-align: center; margin: 25px 0;">
              <h1 style="color: #667eea; font-size: 32px; letter-spacing: 5px; margin: 0; font-family: monospace;">
                ${otp}
              </h1>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              This code will expire in 10 minutes. If you didn't request this verification, 
              please ignore this email.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 14px;">
                Best regards,<br>
                The TalkAI Team
              </p>
            </div>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © 2024 TalkAI. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ OTP email sent to ${email}:`, info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error);
      throw error;
    }
  }

  /**
   * Send welcome email
   * @param {string} email - Recipient email
   * @param {string} name - User's name
   */
  async sendWelcomeEmail(email, name) {
    if (!this.isInitialized) {
      throw new Error('Email service not initialized');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to TalkAI!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">TalkAI</h1>
            <p style="color: white; margin: 10px 0 0 0;">Welcome aboard!</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to TalkAI, ${name}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Your account has been successfully verified and you're now ready to start 
              chatting with our AI assistant. We're excited to have you on board!
            </p>
            
            <div style="background: white; border: 2px solid #667eea; border-radius: 10px; 
                        padding: 20px; text-align: center; margin: 25px 0;">
              <h3 style="color: #667eea; margin: 0 0 15px 0;">What you can do now:</h3>
              <ul style="text-align: left; color: #666; line-height: 1.8;">
                <li>Start new conversations with our AI</li>
                <li>Save and manage your chat history</li>
                <li>Get intelligent responses to your questions</li>
                <li>Access your conversations from anywhere</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                 style="background: #667eea; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Start Chatting Now
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 14px;">
                Best regards,<br>
                The TalkAI Team
              </p>
            </div>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © 2024 TalkAI. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${email}:`, info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   * @param {string} email - Recipient email
   * @param {string} resetToken - Password reset token
   */
  async sendPasswordResetEmail(email, resetToken) {
    if (!this.isInitialized) {
      throw new Error('Email service not initialized');
    }

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'TalkAI - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">TalkAI</h1>
            <p style="color: white; margin: 10px 0 0 0;">Password Reset</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              You requested a password reset for your TalkAI account. Click the button below 
              to reset your password:
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${resetUrl}" 
                 style="background: #667eea; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              This link will expire in 1 hour. If you didn't request a password reset, 
              please ignore this email.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 14px;">
                Best regards,<br>
                The TalkAI Team
              </p>
            </div>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © 2024 TalkAI. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to ${email}:`, info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw error;
    }
  }
}

// Export singleton instance
const emailService = new EmailService();
export default emailService; 