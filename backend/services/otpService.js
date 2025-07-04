/**
 * OTP Service - Manages OTP generation, storage, and verification
 */
class OTPService {
  constructor() {
    // Store OTPs in memory with expiration
    this.otpStore = new Map();
    this.cleanupInterval = null;
    
    // Start cleanup process
    this.startCleanup();
  }

  /**
   * Generate a 6-digit OTP
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Store OTP with expiration (10 minutes)
   * @param {string} email - Email address
   * @param {string} otp - 6-digit OTP
   */
  storeOTP(email, otp) {
    const expirationTime = Date.now() + (10 * 60 * 1000); // 10 minutes
    
    this.otpStore.set(email, {
      otp,
      expiresAt: expirationTime,
      attempts: 0
    });

    console.log(`✅ OTP stored for ${email}, expires at ${new Date(expirationTime).toISOString()}`);
  }

  /**
   * Verify OTP for an email
   * @param {string} email - Email address
   * @param {string} otp - OTP to verify
   */
  verifyOTP(email, otp) {
    const storedData = this.otpStore.get(email);
    
    if (!storedData) {
      return { valid: false, message: 'OTP not found or expired' };
    }

    // Check if OTP has expired
    if (Date.now() > storedData.expiresAt) {
      this.otpStore.delete(email);
      return { valid: false, message: 'OTP has expired' };
    }

    // Check if too many attempts
    if (storedData.attempts >= 3) {
      this.otpStore.delete(email);
      return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' };
    }

    // Increment attempts
    storedData.attempts++;

    // Verify OTP
    if (storedData.otp === otp) {
      // Remove OTP after successful verification
      this.otpStore.delete(email);
      return { valid: true, message: 'OTP verified successfully' };
    } else {
      return { valid: false, message: 'Invalid OTP' };
    }
  }

  /**
   * Check if OTP exists for an email
   * @param {string} email - Email address
   */
  hasOTP(email) {
    const storedData = this.otpStore.get(email);
    
    if (!storedData) {
      return false;
    }

    // Check if OTP has expired
    if (Date.now() > storedData.expiresAt) {
      this.otpStore.delete(email);
      return false;
    }

    return true;
  }

  /**
   * Remove OTP for an email
   * @param {string} email - Email address
   */
  removeOTP(email) {
    this.otpStore.delete(email);
    console.log(`✅ OTP removed for ${email}`);
  }

  /**
   * Get remaining time for OTP (in seconds)
   * @param {string} email - Email address
   */
  getRemainingTime(email) {
    const storedData = this.otpStore.get(email);
    
    if (!storedData) {
      return 0;
    }

    const remaining = Math.max(0, Math.floor((storedData.expiresAt - Date.now()) / 1000));
    return remaining;
  }

  /**
   * Start cleanup process to remove expired OTPs
   */
  startCleanup() {
    // Clean up expired OTPs every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleanedCount = 0;

      for (const [email, data] of this.otpStore.entries()) {
        if (now > data.expiresAt) {
          this.otpStore.delete(email);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} expired OTPs`);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Stop cleanup process
   */
  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get statistics about stored OTPs
   */
  getStats() {
    const now = Date.now();
    let total = 0;
    let expired = 0;
    let valid = 0;

    for (const [email, data] of this.otpStore.entries()) {
      total++;
      if (now > data.expiresAt) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      total,
      valid,
      expired
    };
  }

  /**
   * Clear all OTPs (useful for testing)
   */
  clearAll() {
    const count = this.otpStore.size;
    this.otpStore.clear();
    console.log(`🧹 Cleared all ${count} OTPs`);
  }
}

// Export singleton instance
const otpService = new OTPService();
export default otpService; 