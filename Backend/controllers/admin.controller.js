const mongoose = require('mongoose');
const User = require('../models/User.model');
const Property = require('../models/Property.model');
const Interest = require('../models/Interest.model');
const {
  sendEmailNotification,
  buildPropertyReviewTemplate
} = require('../utils/notification.utils');

function parsePagination(query = {}) {
  const page = Math.max(parseInt(query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || '20', 10), 1), 100);
  return { page, limit };
}

function buildPropertyReviewFilters(query = {}) {
  const filters = {};

  if (query.status) {
    filters.status = query.status;
  }

  if (query.propertyType) {
    filters.propertyType = query.propertyType;
  }

  if (query.listingType) {
    filters.listingType = query.listingType;
  }

  if (query.city) {
    filters.city = query.city;
  }

  if (query.verified !== undefined) {
    filters.verified = String(query.verified) === 'true';
  }

  if (query.createdBy && mongoose.Types.ObjectId.isValid(query.createdBy)) {
    filters.createdBy = query.createdBy;
  }

  return filters;
}

async function getPropertiesForReview(req, res) {
  try {
    const { page, limit } = parsePagination(req.query);
    const filters = buildPropertyReviewFilters(req.query);

    const [items, total] = await Promise.all([
      Property.find(filters)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('createdBy', 'firstName lastName email phone businessName')
        .lean(),
      Property.countDocuments(filters)
    ]);

    return res.status(200).json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch properties for review'
    });
  }
}

async function reviewProperty(req, res) {
  const { propertyId } = req.params;
  const { status } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid property ID'
    });
  }

  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status must be one of: approved, rejected'
    });
  }

  try {
    const updates = {
      status,
      verified: status === 'approved'
    };

    const property = await Property.findByIdAndUpdate(
      propertyId,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email phone businessName');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    try {
      const sellerEmail = property?.createdBy?.email;
      if (sellerEmail) {
        const sellerName = `${property.createdBy.firstName || ''} ${property.createdBy.lastName || ''}`.trim() || 'Seller';
        const template = buildPropertyReviewTemplate({
          sellerName,
          propertyTitle: property.title,
          status
        });

        await sendEmailNotification({
          to: sellerEmail,
          subject: template.subject,
          text: template.text
        });
      }
    } catch (emailError) {
      console.warn('Property review notification failed:', emailError.message);
    }

    return res.status(200).json({
      success: true,
      message: `Property ${status} successfully`,
      data: property
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to review property'
    });
  }
}

async function getUsers(req, res) {
  try {
    const { page, limit } = parsePagination(req.query);
    const filters = {};

    if (req.query.role) filters.role = req.query.role;
    if (req.query.isActive !== undefined) filters.isActive = String(req.query.isActive) === 'true';
    if (req.query.isVerified !== undefined) filters.isVerified = String(req.query.isVerified) === 'true';
    if (req.query.city) filters.city = req.query.city;

    const [items, total] = await Promise.all([
      User.find(filters)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filters)
    ]);

    return res.status(200).json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch users'
    });
  }
}

async function updateUserStatus(req, res) {
  const { userId } = req.params;
  const { isActive } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID'
    });
  }

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isActive must be boolean'
    });
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user status'
    });
  }
}

async function verifySeller(req, res) {
  const { userId } = req.params;
  const { isVerified = true } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID'
    });
  }

  if (typeof isVerified !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isVerified must be boolean'
    });
  }

  try {
    const seller = await User.findById(userId).select('-password');
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (seller.role !== 'seller') {
      return res.status(400).json({
        success: false,
        message: 'Only seller accounts can be verified using this endpoint'
      });
    }

    seller.isVerified = isVerified;
    await seller.save();

    return res.status(200).json({
      success: true,
      message: `Seller ${isVerified ? 'verified' : 'unverified'} successfully`,
      data: seller
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update seller verification'
    });
  }
}

async function assignLead(req, res) {
  const { leadId } = req.params;
  const { adminId } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid lead ID'
    });
  }

  if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid admin ID'
    });
  }

  try {
    const adminUser = await User.findOne({ _id: adminId, role: 'admin', isActive: true });
    if (!adminUser) {
      return res.status(400).json({
        success: false,
        message: 'Assigned admin not found or inactive'
      });
    }

    const lead = await Interest.findByIdAndUpdate(
      leadId,
      { assignedToAdmin: adminId },
      { new: true, runValidators: true }
    )
      .populate('buyerId', 'firstName lastName email phone')
      .populate('sellerId', 'firstName lastName email phone')
      .populate('propertyId', 'title price city')
      .populate('assignedToAdmin', 'firstName lastName email');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lead assigned successfully',
      data: lead
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to assign lead'
    });
  }
}

async function getDashboardStats(req, res) {
  try {
    const [
      totalUsers,
      totalProperties,
      activeListings,
      pendingListings,
      rejectedListings,
      totalLeads,
      newLeads,
      contactedLeads,
      closedLeads
    ] = await Promise.all([
      User.countDocuments({}),
      Property.countDocuments({}),
      Property.countDocuments({ status: 'approved' }),
      Property.countDocuments({ status: 'pending' }),
      Property.countDocuments({ status: 'rejected' }),
      Interest.countDocuments({}),
      Interest.countDocuments({ status: 'new' }),
      Interest.countDocuments({ status: 'contacted' }),
      Interest.countDocuments({ status: 'closed' })
    ]);

    const conversionRate = totalLeads === 0
      ? 0
      : Number(((closedLeads / totalLeads) * 100).toFixed(2));

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProperties,
        activeListings,
        pendingListings,
        rejectedListings,
        totalLeads,
        newLeads,
        contactedLeads,
        closedLeads,
        conversionRate
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch dashboard stats'
    });
  }
}

module.exports = {
  parsePagination,
  buildPropertyReviewFilters,
  getPropertiesForReview,
  reviewProperty,
  getDashboardStats,
  getUsers,
  updateUserStatus,
  verifySeller,
  assignLead
};
