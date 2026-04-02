/**
 * ERROR HANDLING UTILITY
 * ======================
 * Custom error class and error handling helpers
 * 
 * Usage:
 * throw new AppError('Invalid credentials', 401)
 */

class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.timestamp = new Date();

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
