const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  createProperty,
  getProperties,
  getMyListings,
  getPropertyById,
  updateProperty,
  deleteProperty
} = require('../controllers/properties.controller');

const router = express.Router();

router.get('/', getProperties);
router.get('/my-listings', authenticate, authorize('owner', 'agent', 'builder', 'seller', 'admin'), getMyListings);
router.get('/:propertyId', getPropertyById);

router.post('/', authenticate, authorize('owner', 'agent', 'builder', 'buyer', 'renter', 'admin', 'seller'), createProperty);
router.put('/:propertyId', authenticate, authorize('owner', 'agent', 'builder', 'buyer', 'renter', 'admin', 'seller'), updateProperty);
router.delete('/:propertyId', authenticate, authorize('owner', 'agent', 'builder', 'buyer', 'renter', 'admin', 'seller'), deleteProperty);

module.exports = router;
