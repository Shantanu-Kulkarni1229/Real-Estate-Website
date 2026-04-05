const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty
} = require('../controllers/properties.controller');

const router = express.Router();

router.get('/', getProperties);
router.get('/:propertyId', getPropertyById);

router.post('/', authenticate, authorize('seller', 'buyer', 'renter', 'admin'), createProperty);
router.put('/:propertyId', authenticate, authorize('seller', 'buyer', 'renter', 'admin'), updateProperty);
router.delete('/:propertyId', authenticate, authorize('seller', 'buyer', 'renter', 'admin'), deleteProperty);

module.exports = router;
