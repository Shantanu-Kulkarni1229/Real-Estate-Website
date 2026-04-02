const express = require('express');
const {
  initializeSheetsController,
  syncLeadController
} = require('../controllers/googleSheets.controller');

const router = express.Router();

// Initialize spreadsheet tabs and headers.
router.post('/initialize', initializeSheetsController);

// Sync one buyer + one seller + one relationship row.
router.post('/sync-lead', syncLeadController);

module.exports = router;
