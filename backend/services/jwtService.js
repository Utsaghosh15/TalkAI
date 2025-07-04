import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * JWT Service - Handles JWT token generation, verification, and management
 */
class JWTService {
  constructor() {
    this.secret = process.env.JWT_SECRET;
    this.expiresIn = '7d'; // Token expires in 7 days
    
    if (!this.secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
  }

  /**
   * Generate JWT token for user
   * @param {Object} user - User object
   */
  generateToken(user) {
    const payload = {
      userId: user._id,
      email: user.email,
      isVerified: user.isVerified,
      googleId: user.googleId || null
    };

    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
      issuer: 'talkai-backend',
      audience: 'talkai-users'
    });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.secret, {
        issuer: 'talkai-backend',
        audience: 'talkai-users'
      });
      
      return {
        valid: true,
        payload: decoded
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Decode JWT token without verification (for debugging)
   * @param {string} token - JWT token
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  /**
   * Get token expiration time
   * @param {string} token - JWT token
   */
  getTokenExpiration(token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   */
  isTokenExpired(token) {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) {
      return true;
    }
    
    return Date.now() >= expiration.getTime();
  }

  /**
   * Generate refresh token (for future implementation)
   * @param {Object} user - User object
   */
  generateRefreshToken(user) {
    const payload = {
      userId: user._id,
      type: 'refresh'
    };

    return jwt.sign(payload, this.secret, {
      expiresIn: '30d', // Refresh token expires in 30 days
      issuer: 'talkai-backend',
      audience: 'talkai-users'
    });
  }

  /**
   * Generate short-lived token (for email verification, password reset, etc.)
   * @param {Object} payload - Token payload
   * @param {string} expiresIn - Expiration time (default: 1 hour)
   */
  generateShortToken(payload, expiresIn = '1h') {
    return jwt.sign(payload, this.secret, {
      expiresIn,
      issuer: 'talkai-backend',
      audience: 'talkai-users'
    });
  }
}

// Export singleton instance
const jwtService = new JWTService();
export default jwtService; 