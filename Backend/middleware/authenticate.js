/**
 * AUTHENTICATION MIDDLEWARE
 * ========================
 * Verifies JWT token and authenticates users
 * 
 * Purpose:
 * - Check if user is authenticated
 * - Extract user info from JWT token
 * - Attach user to request object
 * 
 * Usage: 
 * app.get('/protected-route', authenticate, controllerFunction)
 */

const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    console.log(`✓ User authenticated: ${decoded.userId} (${decoded.role})`);
    next();

  } catch (error) {
    console.error('Authentication Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = authenticate;
