const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  getTestimonials,
  upsertTestimonial
} = require('../controllers/testimonials.controller');

const router = express.Router();

router.get('/', getTestimonials);
router.post('/', authenticate, authorize('buyer', 'renter', 'owner', 'agent', 'builder', 'admin', 'seller'), upsertTestimonial);

module.exports = router;
