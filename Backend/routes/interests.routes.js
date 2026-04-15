const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  createInterest,
  getMyInterests,
  getMyLeads,
  getAllLeads,
  updateMyLeadStatus,
  updateLeadStatus
} = require('../controllers/interests.controller');

const router = express.Router();

router.post('/', createInterest);
router.get('/my-interests', authenticate, getMyInterests);
router.get('/my-leads', authenticate, authorize('owner', 'agent', 'builder', 'seller', 'admin'), getMyLeads);
router.patch('/my-leads/:leadId/status', authenticate, authorize('owner', 'agent', 'builder', 'seller', 'admin'), updateMyLeadStatus);

router.get('/', authenticate, authorize('admin'), getAllLeads);
router.patch('/:leadId/status', authenticate, authorize('admin'), updateLeadStatus);

module.exports = router;
