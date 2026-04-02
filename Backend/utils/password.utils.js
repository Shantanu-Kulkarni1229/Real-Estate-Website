/**
 * PASSWORD UTILITY FUNCTIONS
 * ==========================
 * Helper functions for password hashing and verification
 * 
 * Functions:
 * - hashPassword(): Hash plain password
 * - comparePassword(): Compare plain password with hash
 */

const bcrypt = require('bcryptjs');

/**
 * Hash Password
 * @param {String} password - Plain password to hash
 * @param {Number} saltRounds - Rounds for bcrypt (default: 10)
 * @returns {Promise<String>} Hashed password
 */
const hashPassword = async (password, saltRounds = 10) => {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Compare Password
 * @param {String} plainPassword - Plain password from user
 * @param {String} hashedPassword - Hashed password from database
 * @returns {Promise<Boolean>} True if passwords match
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', error);
    throw new Error('Failed to compare password');
  }
};

module.exports = {
  hashPassword,
  comparePassword
};
