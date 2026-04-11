const User = require('../models/User.model');
const { generateToken } = require('../utils/jwt.utils');
const { comparePassword } = require('../utils/password.utils');

const ROLE_ALIASES = {
  seller: 'owner',
  buyer: 'user',
  renter: 'user'
};

const COMMERCIAL_ROLES = ['owner', 'agent', 'builder'];
const CONSUMER_ROLES = ['user'];
const ALLOWED_REGISTER_ROLES = [...COMMERCIAL_ROLES, ...CONSUMER_ROLES];
const ALLOWED_LOGIN_ROLES = [...ALLOWED_REGISTER_ROLES, 'admin'];

function normalizeRole(role) {
  const rawRole = String(role || '').trim().toLowerCase();
  return ROLE_ALIASES[rawRole] || rawRole || 'owner';
}

function sanitizeUser(userDoc) {
  return {
    userId: userDoc._id,
    firstName: userDoc.firstName,
    lastName: userDoc.lastName,
    email: userDoc.email,
    phone: userDoc.phone,
    whatsappNumber: userDoc.whatsappNumber,
    role: normalizeRole(userDoc.role),
    businessName: userDoc.businessName || '',
    organizationName: userDoc.organizationName || '',
    subscriptionPlan: userDoc.subscriptionPlan || 'free',
    subscriptionStatus: userDoc.subscriptionStatus || 'inactive',
    isVerified: userDoc.isVerified,
    isActive: userDoc.isActive,
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt
  };
}

function validateRegisterBody(body = {}) {
  const requiredFields = ['firstName', 'lastName', 'email', 'password', 'phone'];
  const missing = requiredFields.filter((field) => !body[field]);
  return missing;
}

async function register(req, res) {
  const missing = validateRegisterBody(req.body);
  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missing.join(', ')}`
    });
  }

  const { firstName, lastName, email, password, phone, whatsappNumber, role, businessName, organizationName, licenseNumber } = req.body;
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin users can only be created using the dedicated admin script'
    });
  }

  if (!ALLOWED_REGISTER_ROLES.includes(normalizedRole)) {
    return res.status(400).json({
      success: false,
      message: `Allowed roles: ${ALLOWED_REGISTER_ROLES.join(', ')}`
    });
  }

  if (['agent', 'builder'].includes(normalizedRole) && !String(businessName || organizationName || '').trim()) {
    return res.status(400).json({
      success: false,
      message: 'Business or organization name is required for agent and builder accounts'
    });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      phone,
      whatsappNumber,
      role: normalizedRole,
      businessName: businessName || organizationName || '',
      organizationName: organizationName || businessName || '',
      licenseNumber: licenseNumber || ''
    });

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: normalizeRole(user.role)
    };

    const token = generateToken(tokenPayload);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: sanitizeUser(user),
      token
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to register user'
    });
  }
}

async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account is inactive'
      });
    }

    const normalizedRole = normalizeRole(user.role);
    if (!ALLOWED_LOGIN_ROLES.includes(normalizedRole)) {
      return res.status(403).json({
        success: false,
        message: `Login is not allowed for role: ${normalizedRole}`
      });
    }

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: normalizedRole
    };

    const token = generateToken(tokenPayload);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: sanitizeUser(user),
      token
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to login'
    });
  }
}

async function verify(req, res) {
  const normalizedRole = normalizeRole(req.user.role);
  if (!ALLOWED_LOGIN_ROLES.includes(normalizedRole)) {
    return res.status(403).json({
      success: false,
      message: 'Session role is no longer allowed for login access'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: {
      userId: req.user.userId,
      email: req.user.email,
      role: normalizedRole
    }
  });
}

module.exports = {
  register,
  login,
  verify,
  sanitizeUser
};
