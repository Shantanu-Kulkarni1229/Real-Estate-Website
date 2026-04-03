const mongoose = require('mongoose');
const Interest = require('../models/Interest.model');
const Property = require('../models/Property.model');
const User = require('../models/User.model');
const {
  initializeGoogleSheets,
  syncInterestToGoogleSheets
} = require('../utils/googleSheets.utils');
const {
  sendBulkEmailNotifications,
  buildLeadNotificationTemplate
} = require('../utils/notification.utils');

function buildLeadFilters(query) {
  const filters = {};

  if (query.status) {
    filters.status = query.status;
  }

  if (query.propertyId && mongoose.Types.ObjectId.isValid(query.propertyId)) {
    filters.propertyId = query.propertyId;
  }

  if (query.sellerId && mongoose.Types.ObjectId.isValid(query.sellerId)) {
    filters.sellerId = query.sellerId;
  }

  if (query.assignedToAdmin && mongoose.Types.ObjectId.isValid(query.assignedToAdmin)) {
    filters.assignedToAdmin = query.assignedToAdmin;
  }

  return filters;
}

async function createInterest(req, res) {
  const {
    name,
    mobileNumber,
    email,
    whatsappNumber,
    message,
    propertyId,
    userId
  } = req.body || {};

  if (!name || !mobileNumber || !email || !propertyId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: name, mobileNumber, email, propertyId'
    });
  }

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid property ID'
    });
  }

  const buyerId = req.user && req.user.userId ? req.user.userId : userId;
  if (!buyerId || !mongoose.Types.ObjectId.isValid(buyerId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid buyer user ID'
    });
  }

  try {
    const property = await Property.findById(propertyId);
    if (!property || property.status !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (property.createdBy.toString() === buyerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Seller cannot create interest in their own property'
      });
    }

    const existing = await Interest.findOne({ buyerId, propertyId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Interest already submitted for this property'
      });
    }

    const lead = await Interest.create({
      buyerId,
      propertyId,
      sellerId: property.createdBy,
      name,
      email,
      mobile: mobileNumber,
      whatsapp: whatsappNumber || mobileNumber,
      message,
      status: 'new'
    });

    let sheetSync = { synced: false };
    try {
      await initializeGoogleSheets();

      const [buyerUser, sellerUser] = await Promise.all([
        User.findById(buyerId),
        User.findById(property.createdBy)
      ]);

      const syncResult = await syncInterestToGoogleSheets({
        buyer: {
          id: buyerId.toString(),
          name: name || `${buyerUser?.firstName || ''} ${buyerUser?.lastName || ''}`.trim(),
          email,
          mobile: mobileNumber,
          whatsapp: whatsappNumber || mobileNumber
        },
        seller: {
          id: property.createdBy.toString(),
          name: `${sellerUser?.firstName || ''} ${sellerUser?.lastName || ''}`.trim() || property.ownerName || 'Seller',
          email: sellerUser?.email || '',
          mobile: sellerUser?.phone || property.contactNumber || '',
          whatsapp: sellerUser?.whatsappNumber || sellerUser?.phone || property.contactNumber || ''
        },
        property: {
          id: property._id.toString(),
          title: property.title,
          type: property.propertyType,
          purpose: property.listingType,
          price: property.price,
          city: property.city
        },
        interest: {
          id: lead._id.toString(),
          status: lead.status,
          createdAt: lead.createdAt
        }
      });

      sheetSync = { synced: true, data: syncResult };
    } catch (sheetError) {
      sheetSync = { synced: false, error: sheetError.message };
    }

    try {
      const admins = await User.find({ role: 'admin', isActive: true }).select('email firstName lastName');
      if (admins.length > 0) {
        const template = buildLeadNotificationTemplate({
          buyerName: name,
          propertyTitle: property.title,
          city: property.city,
          status: lead.status
        });

        const emails = admins
          .filter((admin) => admin.email)
          .map((admin) => ({
            to: admin.email,
            subject: template.subject,
            text: template.text
          }));

        await sendBulkEmailNotifications(emails);
      }
    } catch (emailError) {
      console.warn('Admin lead notification failed:', emailError.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Interest created successfully',
      data: lead,
      googleSheets: sheetSync
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create interest'
    });
  }
}

async function getMyInterests(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);

    const filters = { buyerId: req.user.userId };
    if (req.query.status) {
      filters.status = req.query.status;
    }

    const [items, total] = await Promise.all([
      Interest.find(filters)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('propertyId', 'title propertyType listingType price city status images')
        .populate('sellerId', 'firstName lastName businessName')
        .lean(),
      Interest.countDocuments(filters)
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
      message: error.message || 'Failed to fetch interests'
    });
  }
}

async function getAllLeads(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const filters = buildLeadFilters(req.query);

    const [items, total] = await Promise.all([
      Interest.find(filters)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('buyerId', 'firstName lastName email phone whatsappNumber role')
        .populate('sellerId', 'firstName lastName email phone businessName')
        .populate('propertyId', 'title propertyType listingType price city status')
        .populate('assignedToAdmin', 'firstName lastName email')
        .lean(),
      Interest.countDocuments(filters)
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
      message: error.message || 'Failed to fetch leads'
    });
  }
}

async function updateLeadStatus(req, res) {
  const { leadId } = req.params;
  const { status, assignedToAdmin } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid lead ID'
    });
  }

  if (!status || !['new', 'contacted', 'closed'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status must be one of: new, contacted, closed'
    });
  }

  const updates = { status };
  if (assignedToAdmin && mongoose.Types.ObjectId.isValid(assignedToAdmin)) {
    updates.assignedToAdmin = assignedToAdmin;
  }

  try {
    const updatedLead = await Interest.findByIdAndUpdate(
      leadId,
      updates,
      { new: true, runValidators: true }
    )
      .populate('buyerId', 'firstName lastName email phone')
      .populate('sellerId', 'firstName lastName email phone')
      .populate('propertyId', 'title price city')
      .populate('assignedToAdmin', 'firstName lastName email');

    if (!updatedLead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lead status updated successfully',
      data: updatedLead
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update lead status'
    });
  }
}

module.exports = {
  createInterest,
  getMyInterests,
  getAllLeads,
  updateLeadStatus,
  buildLeadFilters
};
