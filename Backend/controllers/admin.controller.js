const mongoose = require('mongoose');
const User = require('../models/User.model');
const Property = require('../models/Property.model');
const Interest = require('../models/Interest.model');
const SubscriptionFeeConfig = require('../models/SubscriptionFeeConfig.model');
const {
  sendEmailNotification,
  sendBulkEmailNotifications,
  buildPropertyReviewTemplate
} = require('../utils/notification.utils');

const SUBSCRIPTION_ROLES = ['owner', 'agent', 'builder'];

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
  const { status, reviewMessage } = req.body || {};

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

  const normalizedReviewMessage = typeof reviewMessage === 'string'
    ? reviewMessage.trim()
    : '';

  if (status === 'rejected' && !normalizedReviewMessage) {
    return res.status(400).json({
      success: false,
      message: 'reviewMessage is required when rejecting a property'
    });
  }

  try {
    const updates = {
      status,
      verified: status === 'approved',
      reviewNotes: normalizedReviewMessage || undefined
    };

    if (status === 'approved' && !normalizedReviewMessage) {
      updates.reviewNotes = 'Property approved and verified by admin';
    }

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
          status,
          reviewMessage: property.reviewNotes
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

    const eligibleRoles = ['seller', 'owner', 'agent', 'builder'];
    if (!eligibleRoles.includes(seller.role)) {
      return res.status(400).json({
        success: false,
        message: 'Only owner, agent, builder, or seller accounts can be verified using this endpoint'
      });
    }

    seller.isVerified = isVerified;
    await seller.save();

    return res.status(200).json({
      success: true,
      message: `Commercial account ${isVerified ? 'verified' : 'unverified'} successfully`,
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

async function sendLeadEmail(req, res) {
  const { leadId } = req.params;
  const { target = 'both', subject, message } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid lead ID'
    });
  }

  if (!['buyer', 'seller', 'both'].includes(target)) {
    return res.status(400).json({
      success: false,
      message: 'target must be one of: buyer, seller, both'
    });
  }

  try {
    const lead = await Interest.findById(leadId)
      .populate('buyerId', 'firstName lastName email')
      .populate('sellerId', 'firstName lastName email')
      .populate('propertyId', 'title city');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    const propertyTitle = lead?.propertyId?.title || 'Property';
    const propertyCity = lead?.propertyId?.city || 'N/A';
    const buyerName = `${lead?.buyerId?.firstName || ''} ${lead?.buyerId?.lastName || ''}`.trim() || lead.name || 'Buyer';
    const sellerName = `${lead?.sellerId?.firstName || ''} ${lead?.sellerId?.lastName || ''}`.trim() || 'Seller';

    const buyerEmail = lead?.buyerId?.email || lead.email;
    const sellerEmail = lead?.sellerId?.email;

    const notifications = [];

    if ((target === 'buyer' || target === 'both') && buyerEmail) {
      notifications.push({
        to: buyerEmail,
        subject: subject || `Update on your interest for ${propertyTitle}`,
        text: message || `Hi ${buyerName}, this is an update from CityPloter regarding your interest in "${propertyTitle}" (${propertyCity}). Our team is coordinating the next steps and will reach out shortly.`
      });
    }

    if ((target === 'seller' || target === 'both') && sellerEmail) {
      notifications.push({
        to: sellerEmail,
        subject: subject || `Lead update for ${propertyTitle}`,
        text: message || `Hi ${sellerName}, this is an update from CityPloter for your listing "${propertyTitle}" (${propertyCity}). A buyer lead is currently in progress and our team is handling the coordination.`
      });
    }

    if (notifications.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid recipient email found for the selected target'
      });
    }

    const results = await sendBulkEmailNotifications(notifications);

    return res.status(200).json({
      success: true,
      message: 'Lead email notifications processed',
      data: {
        leadId,
        target,
        results
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send lead email'
    });
  }
}

async function deleteLead(req, res) {
  const { leadId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid lead ID'
    });
  }

  try {
    const deleted = await Interest.findByIdAndDelete(leadId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete lead'
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

async function getSubscriptionFees(req, res) {
  try {
    let config = await SubscriptionFeeConfig.findOne({ key: 'default' }).lean();

    if (!config) {
      const created = await SubscriptionFeeConfig.create({ key: 'default' });
      config = created.toObject();
    }

    return res.status(200).json({
      success: true,
      data: {
        currency: config.currency || 'INR',
        fees: {
          owner: Number(config?.fees?.owner || 0),
          agent: Number(config?.fees?.agent || 0),
          builder: Number(config?.fees?.builder || 0)
        },
        updatedAt: config.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch subscription fee configuration'
    });
  }
}

async function updateSubscriptionFees(req, res) {
  const bodyFees = req.body && typeof req.body === 'object'
    ? (req.body.fees && typeof req.body.fees === 'object' ? req.body.fees : req.body)
    : {};

  const updates = {};
  for (const role of SUBSCRIPTION_ROLES) {
    if (!Object.prototype.hasOwnProperty.call(bodyFees, role)) {
      continue;
    }

    const numericValue = Number(bodyFees[role]);
    if (!Number.isFinite(numericValue) || numericValue < 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid fee for ${role}. Please provide a non-negative number`
      });
    }

    updates[`fees.${role}`] = numericValue;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid subscription fee values were provided'
    });
  }

  try {
    const config = await SubscriptionFeeConfig.findOneAndUpdate(
      { key: 'default' },
      {
        $set: {
          ...updates,
          updatedBy: req.user.userId
        }
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true
      }
    ).lean();

    return res.status(200).json({
      success: true,
      message: 'Subscription fees updated successfully',
      data: {
        currency: config.currency || 'INR',
        fees: {
          owner: Number(config?.fees?.owner || 0),
          agent: Number(config?.fees?.agent || 0),
          builder: Number(config?.fees?.builder || 0)
        },
        updatedAt: config.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update subscription fee configuration'
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
  assignLead,
  sendLeadEmail,
  deleteLead,
  getSubscriptionFees,
  updateSubscriptionFees
};
