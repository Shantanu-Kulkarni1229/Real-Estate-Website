const mongoose = require('mongoose');
const User = require('../models/User.model');
const Property = require('../models/Property.model');
const Interest = require('../models/Interest.model');

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
  getDashboardStats
};
