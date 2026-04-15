const mongoose = require('mongoose');
const Property = require('../models/Property.model');

function parsePositiveNumber(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseDate(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function parseBoolean(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
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

function normalizeRentDetails(body, listingType, fallbackPrice) {
  if (listingType !== 'rent') {
    return undefined;
  }

  const rawRentDetails = body?.rentDetails || {};
  const monthlyRent = parsePositiveNumber(
    rawRentDetails.monthlyRent ?? body?.monthlyRent ?? fallbackPrice
  );
  const depositRequired = parseBoolean(rawRentDetails.depositRequired ?? body?.depositRequired);
  const securityDeposit = parsePositiveNumber(
    rawRentDetails.securityDeposit ?? body?.securityDeposit
  );

  return {
    monthlyRent,
    depositRequired,
    securityDeposit: depositRequired ? securityDeposit : undefined
  };
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
  const listingType = body.listingType;
  const rentDetails = normalizeRentDetails(body, listingType, basePrice);
  const normalizedPrice = listingType === 'rent'
    ? rentDetails?.monthlyRent
    : basePrice;

  return {
    createdBy: sellerId,
    sellerId,
    title: body.title,
    description: body.description,
    propertyType: body.propertyType,
    listingType,
    price: normalizedPrice,
    rentDetails,
    unitConfigurations,
    negotiable: body.negotiable,
    possessionStatus: body.possessionStatus,
    possessionDate: parseDate(body.possessionDate),
    address: body.address,
    city: body.city,
    state: body.state,
    pincode: body.pincode,
    locality: body.locality,
    landmark: body.landmark,
    googleMapsLink: body.googleMapsLink,
    latitude: body.latitude,
    longitude: body.longitude,
    specifications: body.specifications,
    amenities: body.amenities,
    images: body.images,
    videos: body.videos,
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
    'rentDetails',
    'monthlyRent',
    'depositRequired',
    'securityDeposit',
    'unitConfigurations',
    'negotiable',
    'possessionStatus',
    'possessionDate',
    'address',
    'city',
    'state',
    'pincode',
    'locality',
    'landmark',
    'googleMapsLink',
    'latitude',
    'longitude',
    'specifications',
    'amenities',
    'images',
    'videos',
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

  if (Object.prototype.hasOwnProperty.call(updates, 'possessionDate')) {
    updates.possessionDate = parseDate(updates.possessionDate);
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
  const rentDetails = normalizeRentDetails(req.body || {}, req.body?.listingType, req.body?.price);

  const missing = required.filter((field) => {
    if (field === 'price' && normalizedUnitConfigurations.length > 0) {
      return false;
    }

    if (field === 'price' && req.body?.listingType === 'rent') {
      return false;
    }

    return !req.body || req.body[field] === undefined || req.body[field] === null || req.body[field] === '';
  });

  if (req.body?.listingType === 'rent') {
    if (rentDetails?.monthlyRent === undefined) {
      missing.push('monthlyRent');
    }

    if (rentDetails?.depositRequired && rentDetails.securityDeposit === undefined) {
      missing.push('securityDeposit');
    }
  }

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

async function getMyListings(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);

    const filters = {
      createdBy: req.user.userId
    };

    if (req.query.status && ['pending', 'approved', 'rejected'].includes(req.query.status)) {
      filters.status = req.query.status;
    }

    if (req.query.listingType) {
      filters.listingType = req.query.listingType;
    }

    if (req.query.propertyType) {
      filters.propertyType = req.query.propertyType;
    }

    if (req.query.search) {
      filters.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { locality: { $regex: req.query.search, $options: 'i' } },
        { city: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [items, total] = await Promise.all([
      Property.find(filters)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
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
      message: error.message || 'Failed to fetch your listings'
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
    const nextListingType = updates.listingType || property.listingType;
    const priceForRent = Object.prototype.hasOwnProperty.call(updates, 'price')
      ? updates.price
      : property.price;
    const normalizedRentDetails = normalizeRentDetails(req.body || {}, nextListingType, priceForRent);

    if (nextListingType === 'rent') {
      if (normalizedRentDetails?.monthlyRent === undefined) {
        return res.status(400).json({
          success: false,
          message: 'monthlyRent is required for rent listings'
        });
      }

      if (normalizedRentDetails?.depositRequired && normalizedRentDetails.securityDeposit === undefined) {
        return res.status(400).json({
          success: false,
          message: 'securityDeposit is required when deposit is marked as required'
        });
      }

      updates.rentDetails = normalizedRentDetails;
      updates.price = normalizedRentDetails.monthlyRent;
    } else {
      updates.rentDetails = undefined;
    }

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
  getMyListings,
  getPropertyById,
  updateProperty,
  deleteProperty,
  buildFilters,
  getCreatePayload,
  getUpdatePayload,
  isOwner
};
