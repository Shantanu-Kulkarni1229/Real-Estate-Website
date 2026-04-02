const {
  initializeGoogleSheets,
  syncInterestToGoogleSheets,
  validateSyncPayload
} = require('../utils/googleSheets.utils');

async function initializeSheetsController(req, res) {
  try {
    const result = await initializeGoogleSheets();
    return res.status(200).json({
      success: true,
      message: 'Google Sheets initialized successfully',
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function syncLeadController(req, res) {
  const missing = validateSyncPayload(req.body);
  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Invalid payload. Missing: ${missing.join(', ')}`
    });
  }

  try {
    const result = await syncInterestToGoogleSheets(req.body);
    return res.status(201).json({
      success: true,
      message: 'Buyer, seller and relationship rows synced to Google Sheets',
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  initializeSheetsController,
  syncLeadController
};
