/**
 * JWT UTILITY FUNCTIONS
 * =====================
 * Helper functions for creating and verifying JWT tokens
 * 
 * Functions:
 * - generateToken(): Create JWT token for user
 * - verifyToken(): Verify and decode JWT token
 */

const jwt = require('jsonwebtoken');

/**
 * Generate JWT Token
 * @param {Object} payload - Data to encode in token (userId, email, role)
 * @param {String} expiresIn - Token expiration time (default: 7d)
 * @returns {String} JWT token
 */
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE || '7d') => {
  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: expiresIn,
      issuer: 'real-estate-backend'
    });
    return token;
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('Failed to generate token');
  }
};

/**
 * Verify JWT Token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error.message);
    throw new Error('Invalid or expired token');
  }
};

module.exports = {
  generateToken,
  verifyToken
};
