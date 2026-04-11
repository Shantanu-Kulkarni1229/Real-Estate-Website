/**
 * AUTHORIZATION MIDDLEWARE - ROLE-BASED ACCESS CONTROL (RBAC)
 * ============================================================
 * Verifies if authenticated user has required role
 * 
 * User Roles:
 * - admin: Full access to all resources
 * - seller: Can manage own properties, view leads
 * - buyer: Can browse properties, mark interest
 * - renter: Can browse rental properties, mark interest
 * 
 * Purpose:
 * - Check if user has required role
 * - Prevent unauthorized access
 * 
 * Usage:
 * app.post('/admin/route', authenticate, authorize('admin'), controllerFunction)
 * app.post('/route', authenticate, authorize(['seller', 'buyer']), controllerFunction)
 */

const ROLE_ALIASES = {
  seller: 'owner'
};

function normalizeRole(role) {
  const rawRole = String(role || '').trim().toLowerCase();
  return ROLE_ALIASES[rawRole] || rawRole;
}

const authorize = (...allowedRoles) => {
  const normalizedRoles = allowedRoles.flat().map(normalizeRole);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const userRole = normalizeRole(req.user.role);

    if (!normalizedRoles.includes(userRole)) {
      console.warn(`✗ Unauthorized access attempt: ${req.user.userId} (${userRole}) tried to access admin resource`);
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${normalizedRoles.join(', ')}`,
        userRole: userRole
      });
    }

    console.log(`✓ Authorization successful: ${userRole} can access this resource`);
    next();
  };
};

module.exports = authorize;
