const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  createInterest,
  getMyInterests,
  getAllLeads,
  updateLeadStatus
} = require('../controllers/interests.controller');

const router = express.Router();

router.post('/', authenticate, authorize('buyer', 'renter'), createInterest);
router.get('/my-interests', authenticate, authorize('buyer', 'renter'), getMyInterests);

router.get('/', authenticate, authorize('admin'), getAllLeads);
router.patch('/:leadId/status', authenticate, authorize('admin'), updateLeadStatus);

module.exports = router;
