const mongoose = require('mongoose');
const Property = require('../models/Property.model');

function parsePositiveNumber(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function normalizeCityName(value) {
  if (!value) {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();
  const cityAliases = {
    aurangabad: 'Chhatrapati Sambhajinagar'
  };

  return cityAliases[normalized] || String(value).trim();
}

function normalizeRole(role) {
  const rawRole = String(role || '').trim().toLowerCase();
  return rawRole === 'seller' ? 'owner' : rawRole;
}

function normalizeUnitConfigurations(rawUnits) {
  if (!Array.isArray(rawUnits)) {
    return [];
  }

  return rawUnits
    .map((unit) => ({
      unitLabel: String(unit?.unitLabel || '').trim(),
      bhk: parsePositiveNumber(unit?.bhk),
      sizeSqFt: parsePositiveNumber(unit?.sizeSqFt),
      price: parsePositiveNumber(unit?.price)
    }))
    .filter((unit) => unit.price !== undefined)
    .map((unit) => ({
      unitLabel: unit.unitLabel || undefined,
      bhk: unit.bhk,
      sizeSqFt: unit.sizeSqFt,
      price: unit.price
    }));
}

function getBasePrice(explicitPrice, unitConfigurations) {
  const normalizedPrice = parsePositiveNumber(explicitPrice);
  if (!Array.isArray(unitConfigurations) || unitConfigurations.length === 0) {
    return normalizedPrice;
  }

  const unitPrices = unitConfigurations
    .map((unit) => parsePositiveNumber(unit?.price))
    .filter((value) => value !== undefined);

  if (unitPrices.length === 0) {
    return normalizedPrice;
  }

  return Math.min(...unitPrices);
}

function isPaidAgent(user) {
  if (!user) {
    return false;
  }

  return normalizeRole(user.role) === 'agent' && String(user.subscriptionStatus || '').toLowerCase() === 'active';
}

function withContactMetadata(propertyDoc) {
  if (!propertyDoc) {
    return propertyDoc;
  }

  const { contactNumber, createdBy, ...rest } = propertyDoc;
  const safeCreator = createdBy
    ? {
        ...createdBy,
        role: normalizeRole(createdBy.role),
        subscriptionStatus: createdBy.subscriptionStatus || 'inactive'
      }
    : createdBy;

  const directContactEnabled = isPaidAgent(safeCreator);

  return {
    ...rest,
    createdBy: safeCreator,
    directContactEnabled,
    contactMode: directContactEnabled ? 'direct-agent' : 'admin-assisted',
    publicContactNumber: directContactEnabled ? contactNumber : ''
  };
}

function isOwner(requestUser, propertyDoc) {
  if (!requestUser || !propertyDoc) {
    return false;
  }

  if (requestUser.role === 'admin') {
    return true;
  }

  return propertyDoc.createdBy.toString() === requestUser.userId;
}

function getCreatePayload(body, user) {
  const sellerId = body.createdBy || user.userId;
  const unitConfigurations = normalizeUnitConfigurations(body.unitConfigurations);
  const basePrice = getBasePrice(body.price, unitConfigurations);

  return {
    createdBy: sellerId,
    sellerId,
    title: body.title,
    description: body.description,
    propertyType: body.propertyType,
    listingType: body.listingType,
    price: basePrice,
    unitConfigurations,
    negotiable: body.negotiable,
    address: body.address,
    city: body.city,
    state: body.state,
    pincode: body.pincode,
    locality: body.locality,
    landmark: body.landmark,
    latitude: body.latitude,
    longitude: body.longitude,
    specifications: body.specifications,
    amenities: body.amenities,
    images: body.images,
    videos: body.videos,
    virtualTourUrl: body.virtualTourUrl,
    ownerName: body.ownerName,
    contactNumber: body.contactNumber,
    ownershipType: body.ownershipType,
    availableFrom: body.availableFrom
  };
}

function getUpdatePayload(body, isAdmin) {
  const allowedFields = [
    'title',
    'description',
    'propertyType',
    'listingType',
    'price',
    'unitConfigurations',
    'negotiable',
    'address',
    'city',
    'state',
    'pincode',
    'locality',
    'landmark',
    'latitude',
    'longitude',
    'specifications',
    'amenities',
    'images',
    'videos',
    'virtualTourUrl',
    'ownerName',
    'contactNumber',
    'ownershipType',
    'availableFrom'
  ];

  if (isAdmin) {
    allowedFields.push('status', 'verified');
  }

  const updates = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      updates[field] = body[field];
    }
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'unitConfigurations')) {
    updates.unitConfigurations = normalizeUnitConfigurations(updates.unitConfigurations);
    const derivedPrice = getBasePrice(updates.price, updates.unitConfigurations);
    if (derivedPrice !== undefined) {
      updates.price = derivedPrice;
    }
  }

  return updates;
}

function buildFilters(query) {
  const filters = {};

  if (query.city) filters.city = normalizeCityName(query.city);
  if (query.state) filters.state = query.state;
  if (query.propertyType) filters.propertyType = query.propertyType;
  if (query.listingType) filters.listingType = query.listingType;
  if (query.status) filters.status = query.status;
  if (query.verified !== undefined) filters.verified = String(query.verified) === 'true';

  const minPrice = parsePositiveNumber(query.minPrice);
  const maxPrice = parsePositiveNumber(query.maxPrice);
  if (minPrice !== undefined || maxPrice !== undefined) {
    filters.price = {};
    if (minPrice !== undefined) filters.price.$gte = minPrice;
    if (maxPrice !== undefined) filters.price.$lte = maxPrice;
  }

  const bhk = parsePositiveNumber(query.bhk);
  if (bhk !== undefined) {
    filters['specifications.residential.bhk'] = bhk;
  }

  if (query.furnishing) {
    filters['specifications.residential.furnishing'] = query.furnishing;
  }

  if (query.createdBy && mongoose.Types.ObjectId.isValid(query.createdBy)) {
    filters.createdBy = query.createdBy;
  }

  return filters;
}

async function createProperty(req, res) {
  const required = [
    'title',
    'description',
    'propertyType',
    'listingType',
    'price',
    'address',
    'city',
    'state',
    'pincode',
    'ownerName',
    'contactNumber'
  ];

  const normalizedUnitConfigurations = normalizeUnitConfigurations(req.body?.unitConfigurations);

  const missing = required.filter((field) => {
    if (field === 'price' && normalizedUnitConfigurations.length > 0) {
      return false;
    }

    return !req.body || req.body[field] === undefined || req.body[field] === null || req.body[field] === '';
  });

  if (normalizedUnitConfigurations.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Maximum 100 unit configurations allowed'
    });
  }

  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missing.join(', ')}`
    });
  }

  try {
    const property = await Property.create(getCreatePayload(req.body, req.user));

    return res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create property'
    });
  }
}

async function getProperties(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const sortBy = ['createdAt', 'price', 'viewsCount'].includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
    const sortOrder = String(req.query.sortOrder || 'desc').toLowerCase() === 'asc' ? 1 : -1;

    const filters = buildFilters(req.query);
    if (!req.query.status) {
      filters.status = 'approved';
    }

    if (req.query.search) {
      filters.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { locality: { $regex: req.query.search, $options: 'i' } },
        { city: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [items, total] = await Promise.all([
      Property.find(filters)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('createdBy', 'firstName lastName businessName role subscriptionStatus')
        .lean(),
      Property.countDocuments(filters)
    ]);

    const sanitizedItems = items.map((item) => withContactMetadata(item));

    return res.status(200).json({
      success: true,
      data: sanitizedItems,
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
      message: error.message || 'Failed to fetch properties'
    });
  }
}

async function getPropertyById(req, res) {
  const { propertyId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid property ID'
    });
  }

  try {
    const property = await Property.findById(propertyId)
      .populate('createdBy', 'firstName lastName businessName role subscriptionStatus');
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (property.status !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    await Property.findByIdAndUpdate(propertyId, { $inc: { viewsCount: 1 } });

    const responseData = withContactMetadata(property.toObject());

    return res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch property'
    });
  }
}

async function updateProperty(req, res) {
  const { propertyId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid property ID'
    });
  }

  try {
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (!isOwner(req.user, property)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied for this property'
      });
    }

    const updates = getUpdatePayload(req.body || {}, req.user.role === 'admin');

    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      updates,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: updatedProperty
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update property'
    });
  }
}

async function deleteProperty(req, res) {
  const { propertyId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid property ID'
    });
  }

  try {
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (!isOwner(req.user, property)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied for this property'
      });
    }

    await Property.findByIdAndDelete(propertyId);

    return res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete property'
    });
  }
}

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  buildFilters,
  getCreatePayload,
  getUpdatePayload,
  isOwner
};
