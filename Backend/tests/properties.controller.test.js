jest.mock('../models/Property.model', () => ({
  create: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
}));

const Property = require('../models/Property.model');
const {
  createProperty,
  getProperties,
  updateProperty,
  deleteProperty
} = require('../controllers/properties.controller');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
}

describe('properties.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createProperty should return 400 when required fields are missing', async () => {
    const req = { body: { title: 'Only title' }, user: { userId: 'u1', role: 'seller' } };
    const res = createRes();

    await createProperty(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('createProperty should create property for seller', async () => {
    const req = {
      body: {
        title: '2BHK Apartment',
        description: 'Near metro station',
        propertyType: 'apartment',
        listingType: 'sell',
        price: 5000000,
        address: 'A-12',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        ownerName: 'Seller One',
        contactNumber: '9999999999'
      },
      user: { userId: 'u1', role: 'seller' }
    };
    const res = createRes();

    Property.create.mockResolvedValue({ _id: 'p1', title: '2BHK Apartment' });

    await createProperty(req, res);

    expect(Property.create).toHaveBeenCalledWith(expect.objectContaining({ createdBy: 'u1', sellerId: 'u1' }));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('getProperties should return paginated list', async () => {
    const req = { query: { page: '1', limit: '5' } };
    const res = createRes();

    const chain = {
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([{ _id: 'p1' }])
    };

    Property.find.mockReturnValue(chain);
    Property.countDocuments.mockResolvedValue(1);

    await getProperties(req, res);

    expect(Property.find).toHaveBeenCalledWith(expect.objectContaining({ status: 'approved' }));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('updateProperty should block non-owner sellers', async () => {
    const req = {
      params: { propertyId: '507f1f77bcf86cd799439011' },
      body: { title: 'Updated title' },
      user: { userId: 'u2', role: 'seller' }
    };
    const res = createRes();

    Property.findById.mockResolvedValue({ createdBy: { toString: () => 'u1' } });

    await updateProperty(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('deleteProperty should allow admin', async () => {
    const req = {
      params: { propertyId: '507f1f77bcf86cd799439011' },
      user: { userId: 'admin-1', role: 'admin' }
    };
    const res = createRes();

    Property.findById.mockResolvedValue({ createdBy: { toString: () => 'u1' } });
    Property.findByIdAndDelete.mockResolvedValue({ _id: 'p1' });

    await deleteProperty(req, res);

    expect(Property.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
