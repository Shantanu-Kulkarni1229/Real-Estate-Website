const User = require('../models/User.model');
const { sanitizeUser } = require('./auth.controller');

function canAccessUserProfile(requestUser, targetUserId) {
  if (!requestUser) {
    return false;
  }

  if (requestUser.role === 'admin') {
    return true;
  }

  return requestUser.userId === targetUserId;
}

async function getProfile(req, res) {
  const { userId } = req.params;

  if (!canAccessUserProfile(req.user, userId)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied for this profile'
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user profile'
    });
  }
}

async function updateProfile(req, res) {
  const { userId } = req.params;

  if (!canAccessUserProfile(req.user, userId)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied for this profile'
    });
  }

  const allowedFields = [
    'firstName',
    'lastName',
    'phone',
    'whatsappNumber',
    'address',
    'city',
    'state',
    'pincode',
    'profileImage',
    'businessName'
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates[field] = req.body[field];
    }
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: sanitizeUser(updatedUser)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user profile'
    });
  }
}

async function getMyProfile(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch profile'
    });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getMyProfile,
  canAccessUserProfile
};
