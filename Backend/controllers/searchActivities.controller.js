const mongoose = require('mongoose');
const SearchActivity = require('../models/SearchActivity.model');

function parsePagination(query = {}) {
  const page = Math.max(parseInt(query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || '20', 10), 1), 100);
  return { page, limit };
}

function buildSearchActivityFilters(query = {}) {
  const filters = {};

  if (query.searchType) filters.searchType = query.searchType;
  if (query.city) filters.city = query.city;
  if (query.propertyType) filters.propertyType = query.propertyType;
  if (query.userId && mongoose.Types.ObjectId.isValid(query.userId)) {
    filters.userId = query.userId;
  }

  return filters;
}

async function recordSearchActivity(req, res) {
  const {
    userId,
    searchType,
    queryText,
    city,
    propertyType,
    budgetMin,
    budgetMax,
    sourcePage
  } = req.body || {};

  if (!searchType || !['buy', 'rent'].includes(searchType)) {
    return res.status(400).json({
      success: false,
      message: 'searchType must be one of: buy, rent'
    });
  }

  const payload = {
    searchType,
    queryText,
    city,
    propertyType,
    budgetMin,
    budgetMax,
    sourcePage
  };

  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    payload.userId = userId;
  }

  try {
    const activity = await SearchActivity.create(payload);

    return res.status(201).json({
      success: true,
      message: 'Search activity recorded successfully',
      data: activity
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to record search activity'
    });
  }
}

async function getSearchActivities(req, res) {
  try {
    const { page, limit } = parsePagination(req.query);
    const filters = buildSearchActivityFilters(req.query);

    const [items, total] = await Promise.all([
      SearchActivity.find(filters)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'firstName lastName email phone role city')
        .lean(),
      SearchActivity.countDocuments(filters)
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
      message: error.message || 'Failed to fetch search activities'
    });
  }
}

module.exports = {
  parsePagination,
  buildSearchActivityFilters,
  recordSearchActivity,
  getSearchActivities
};
