const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  initializeSheetsController,
  syncLeadController
} = require('../controllers/googleSheets.controller');

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

// Initialize spreadsheet tabs and headers.
router.post('/initialize', initializeSheetsController);

// Sync one buyer + one seller + one relationship row.
router.post('/sync-lead', syncLeadController);

module.exports = router;
