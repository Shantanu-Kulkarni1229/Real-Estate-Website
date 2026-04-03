jest.mock('../models/Interest.model', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));

jest.mock('../models/Property.model', () => ({
  findById: jest.fn()
}));

jest.mock('../models/User.model', () => ({
  findById: jest.fn(),
  find: jest.fn()
}));

jest.mock('../utils/googleSheets.utils', () => ({
  initializeGoogleSheets: jest.fn(),
  syncInterestToGoogleSheets: jest.fn()
}));

jest.mock('../utils/notification.utils', () => ({
  sendBulkEmailNotifications: jest.fn().mockResolvedValue([]),
  buildLeadNotificationTemplate: jest.fn(() => ({
    subject: 'subject',
    text: 'text'
  }))
}));

const Interest = require('../models/Interest.model');
const Property = require('../models/Property.model');
const User = require('../models/User.model');
const { syncInterestToGoogleSheets } = require('../utils/googleSheets.utils');
const {
  createInterest,
  getAllLeads,
  updateLeadStatus
} = require('../controllers/interests.controller');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
}

describe('interests.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createInterest should validate required fields', async () => {
    const req = { body: { name: 'Buyer' }, user: { userId: '507f1f77bcf86cd799439012' } };
    const res = createRes();

    await createInterest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('createInterest should create lead and sync sheets', async () => {
    const req = {
      body: {
        name: 'Buyer One',
        mobileNumber: '9999999999',
        email: 'buyer@example.com',
        whatsappNumber: '9999999999',
        message: 'Interested',
        propertyId: '507f1f77bcf86cd799439011'
      },
      user: { userId: '507f1f77bcf86cd799439012' }
    };
    const res = createRes();

    Property.findById.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      createdBy: { toString: () => '507f1f77bcf86cd799439099' },
      status: 'approved',
      ownerName: 'Seller',
      contactNumber: '8888888888',
      title: 'Property 1',
      propertyType: 'apartment',
      listingType: 'sell',
      price: 1000000,
      city: 'Delhi'
    });
    Interest.findOne.mockResolvedValue(null);
    Interest.create.mockResolvedValue({
      _id: '507f1f77bcf86cd799439013',
      status: 'new',
      createdAt: new Date('2026-04-03T08:00:00.000Z')
    });
    User.findById
      .mockResolvedValueOnce({ firstName: 'Buyer', lastName: 'One' })
      .mockResolvedValueOnce({ firstName: 'Seller', lastName: 'One', email: 'seller@example.com', phone: '8888888888' });
    User.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([{ email: 'admin@example.com', firstName: 'Admin', lastName: 'One' }])
    });

    syncInterestToGoogleSheets.mockResolvedValue({ success: true });

    await createInterest(req, res);

    expect(Interest.create).toHaveBeenCalled();
    expect(syncInterestToGoogleSheets).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('getAllLeads should return admin lead list', async () => {
    const req = { query: {} };
    const res = createRes();

    const chain = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([{ _id: 'l1' }])
    };

    Interest.find.mockReturnValue(chain);
    Interest.countDocuments.mockResolvedValue(1);

    await getAllLeads(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(Interest.find).toHaveBeenCalled();
  });

  test('updateLeadStatus should reject invalid status', async () => {
    const req = {
      params: { leadId: '507f1f77bcf86cd799439011' },
      body: { status: 'viewed' }
    };
    const res = createRes();

    await updateLeadStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
