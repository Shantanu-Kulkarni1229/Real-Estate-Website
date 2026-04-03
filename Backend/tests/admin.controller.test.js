jest.mock('../models/User.model', () => ({
  countDocuments: jest.fn()
}));

jest.mock('../models/Property.model', () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));

jest.mock('../models/Interest.model', () => ({
  countDocuments: jest.fn()
}));

const User = require('../models/User.model');
const Property = require('../models/Property.model');
const Interest = require('../models/Interest.model');
const {
  getDashboardStats,
  getPropertiesForReview,
  reviewProperty
} = require('../controllers/admin.controller');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
}

describe('admin.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getDashboardStats should return aggregated stats', async () => {
    const req = {};
    const res = createRes();

    User.countDocuments.mockResolvedValueOnce(100);
    Property.countDocuments
      .mockResolvedValueOnce(50)
      .mockResolvedValueOnce(35)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(5);
    Interest.countDocuments
      .mockResolvedValueOnce(200)
      .mockResolvedValueOnce(80)
      .mockResolvedValueOnce(70)
      .mockResolvedValueOnce(50);

    await getDashboardStats(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          totalUsers: 100,
          totalProperties: 50,
          activeListings: 35,
          pendingListings: 10,
          rejectedListings: 5,
          totalLeads: 200,
          closedLeads: 50,
          conversionRate: 25
        })
      })
    );
  });

  test('getPropertiesForReview should return paginated list', async () => {
    const req = { query: { status: 'pending', page: '1', limit: '10' } };
    const res = createRes();

    const chain = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([{ _id: 'p1' }])
    };

    Property.find.mockReturnValue(chain);
    Property.countDocuments.mockResolvedValue(1);

    await getPropertiesForReview(req, res);

    expect(Property.find).toHaveBeenCalledWith(expect.objectContaining({ status: 'pending' }));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('reviewProperty should validate status', async () => {
    const req = {
      params: { propertyId: '507f1f77bcf86cd799439011' },
      body: { status: 'pending' }
    };
    const res = createRes();

    await reviewProperty(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('reviewProperty should approve property and set verified true', async () => {
    const req = {
      params: { propertyId: '507f1f77bcf86cd799439011' },
      body: { status: 'approved' }
    };
    const res = createRes();

    const populated = Promise.resolve({ _id: 'p1', status: 'approved', verified: true });
    Property.findByIdAndUpdate.mockReturnValue({ populate: jest.fn().mockReturnValue(populated) });

    await reviewProperty(req, res);

    expect(Property.findByIdAndUpdate).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      expect.objectContaining({ status: 'approved', verified: true }),
      expect.any(Object)
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
