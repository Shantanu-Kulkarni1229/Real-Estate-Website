const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  getDashboardStats,
  getPropertiesForReview,
  reviewProperty
} = require('../controllers/admin.controller');

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/properties', getPropertiesForReview);
router.patch('/properties/:propertyId/review', reviewProperty);

module.exports = router;
