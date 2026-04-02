jest.mock('../utils/googleSheets.utils', () => ({
  initializeGoogleSheets: jest.fn(),
  syncInterestToGoogleSheets: jest.fn(),
  validateSyncPayload: jest.fn()
}));

const {
  initializeGoogleSheets,
  syncInterestToGoogleSheets,
  validateSyncPayload
} = require('../utils/googleSheets.utils');

const {
  initializeSheetsController,
  syncLeadController
} = require('../controllers/googleSheets.controller');

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
}

describe('googleSheets.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializeSheetsController should return 200 on success', async () => {
    const req = {};
    const res = createMockRes();

    initializeGoogleSheets.mockResolvedValue({ spreadsheetId: 'sheet-1' });

    await initializeSheetsController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Google Sheets initialized successfully'
      })
    );
  });

  test('syncLeadController should return 400 for invalid payload', async () => {
    const req = { body: {} };
    const res = createMockRes();

    validateSyncPayload.mockReturnValue(['buyer.id', 'seller.id']);

    await syncLeadController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(syncInterestToGoogleSheets).not.toHaveBeenCalled();
  });

  test('syncLeadController should return 201 on success', async () => {
    const req = {
      body: {
        buyer: { id: 'b1', name: 'Buyer A' },
        seller: { id: 's1', name: 'Seller A' },
        property: { id: 'p1', title: 'Flat 101' }
      }
    };
    const res = createMockRes();

    validateSyncPayload.mockReturnValue([]);
    syncInterestToGoogleSheets.mockResolvedValue({ linkId: 'link-1' });

    await syncLeadController(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(syncInterestToGoogleSheets).toHaveBeenCalledWith(req.body);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Buyer, seller and relationship rows synced to Google Sheets'
      })
    );
  });
});
