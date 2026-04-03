const User = require('../models/User.model');
const { generateToken } = require('../utils/jwt.utils');
const { comparePassword } = require('../utils/password.utils');

function sanitizeUser(userDoc) {
  return {
    userId: userDoc._id,
    firstName: userDoc.firstName,
    lastName: userDoc.lastName,
    email: userDoc.email,
    phone: userDoc.phone,
    whatsappNumber: userDoc.whatsappNumber,
    role: userDoc.role,
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

  const { firstName, lastName, email, password, phone, whatsappNumber, role } = req.body;

  if (role === 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin users can only be created using the dedicated admin script'
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
      role: role || 'buyer'
    });

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
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

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
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
  return res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: {
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role
    }
  });
}

module.exports = {
  register,
  login,
  verify,
  sanitizeUser
};
