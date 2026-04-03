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
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'JWT_SECRET is not configured'
      });
    }

    // Get token from Authorization header: Bearer <token>
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header must be in format: Bearer <token>'
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
