const express = require('express');
const request = require('supertest');
const { Types } = require('mongoose');

const mockDb = {
  users: [],
  properties: [],
  interests: []
};

function mockClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mockGenerateId() {
  return new Types.ObjectId().toString();
}

function mockMatchesFilters(item, filters = {}) {
  return Object.entries(filters).every(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return true;
    }

    return String(item[key]) === String(value);
  });
}

function mockAsQuery(value) {
  return {
    select() {
      return this;
    },
    populate() {
      return this;
    },
    then(resolve) {
      return resolve(value);
    }
  };
}

function mockCreateListQuery(items) {
  let result = [...items];

  return {
    select() {
      return this;
    },
    sort(sortObj = {}) {
      const [key, order] = Object.entries(sortObj)[0] || [];
      if (key) {
        result.sort((a, b) => {
          const av = a[key] || 0;
          const bv = b[key] || 0;
          if (av < bv) return order === -1 ? 1 : -1;
          if (av > bv) return order === -1 ? -1 : 1;
          return 0;
        });
      }
      return this;
    },
    skip(count = 0) {
      result = result.slice(count);
      return this;
    },
    limit(count = result.length) {
      result = result.slice(0, count);
      return this;
    },
    populate() {
      return this;
    },
    lean: jest.fn(async () => mockClone(result))
  };
}

jest.mock('../models/User.model', () => ({
  findOne: jest.fn((filters = {}) => {
    const user = mockDb.users.find((u) => mockMatchesFilters(u, filters)) || null;
    return {
      select: jest.fn(async () => (user ? { ...user } : null)),
      then: (resolve) => resolve(user)
    };
  }),
  create: jest.fn(async (payload = {}) => {
    const now = new Date().toISOString();
    const user = {
      _id: mockGenerateId(),
      role: payload.role || 'buyer',
      isVerified: payload.isVerified || false,
      isActive: payload.isActive !== false,
      createdAt: now,
      updatedAt: now,
      ...payload
    };
    mockDb.users.push(user);
    return mockClone(user);
  }),
  findById: jest.fn((id) => {
    const user = mockDb.users.find((u) => String(u._id) === String(id));
    if (!user) {
      return mockAsQuery(null);
    }

    const userWithSave = {
      ...user,
      save: async () => {
        user.updatedAt = new Date().toISOString();
        return user;
      }
    };

    return mockAsQuery(userWithSave);
  }),
  findByIdAndUpdate: jest.fn((id, updates = {}) => {
    const user = mockDb.users.find((u) => String(u._id) === String(id));
    if (!user) {
      return mockAsQuery(null);
    }

    Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    return mockAsQuery(mockClone(user));
  }),
  find: jest.fn((filters = {}) => {
    const items = mockDb.users.filter((u) => mockMatchesFilters(u, filters));
    return mockCreateListQuery(items);
  }),
  countDocuments: jest.fn(async (filters = {}) => mockDb.users.filter((u) => mockMatchesFilters(u, filters)).length)
}));

jest.mock('../models/Property.model', () => ({
  create: jest.fn(async (payload = {}) => {
    const now = new Date().toISOString();
    const property = {
      _id: mockGenerateId(),
      status: 'pending',
      verified: false,
      viewsCount: 0,
      createdAt: now,
      updatedAt: now,
      ...payload
    };
    mockDb.properties.push(property);
    return mockClone(property);
  }),
  findById: jest.fn((id) => {
    const property = mockDb.properties.find((p) => String(p._id) === String(id)) || null;
    return mockAsQuery(property ? mockClone(property) : null);
  }),
  findByIdAndUpdate: jest.fn((id, updates = {}) => {
    const property = mockDb.properties.find((p) => String(p._id) === String(id));
    if (!property) {
      return mockAsQuery(null);
    }

    if (updates.$inc && typeof updates.$inc.viewsCount === 'number') {
      property.viewsCount = (property.viewsCount || 0) + updates.$inc.viewsCount;
    }

    const plainUpdates = { ...updates };
    delete plainUpdates.$inc;
    Object.assign(property, plainUpdates, { updatedAt: new Date().toISOString() });

    return mockAsQuery(mockClone(property));
  }),
  findByIdAndDelete: jest.fn(async (id) => {
    const index = mockDb.properties.findIndex((p) => String(p._id) === String(id));
    if (index < 0) return null;
    const [removed] = mockDb.properties.splice(index, 1);
    return mockClone(removed);
  }),
  find: jest.fn((filters = {}) => {
    const items = mockDb.properties.filter((p) => mockMatchesFilters(p, filters));
    return mockCreateListQuery(items);
  }),
  countDocuments: jest.fn(async (filters = {}) => mockDb.properties.filter((p) => mockMatchesFilters(p, filters)).length)
}));

jest.mock('../models/Interest.model', () => ({
  create: jest.fn(async (payload = {}) => {
    const now = new Date().toISOString();
    const lead = {
      _id: mockGenerateId(),
      createdAt: now,
      updatedAt: now,
      ...payload
    };
    mockDb.interests.push(lead);
    return mockClone(lead);
  }),
  findOne: jest.fn(async (filters = {}) => mockDb.interests.find((l) => mockMatchesFilters(l, filters)) || null),
  find: jest.fn((filters = {}) => {
    const items = mockDb.interests.filter((l) => mockMatchesFilters(l, filters));
    return mockCreateListQuery(items);
  }),
  countDocuments: jest.fn(async (filters = {}) => mockDb.interests.filter((l) => mockMatchesFilters(l, filters)).length),
  findByIdAndUpdate: jest.fn((id, updates = {}) => {
    const lead = mockDb.interests.find((l) => String(l._id) === String(id));
    if (!lead) {
      return mockAsQuery(null);
    }

    Object.assign(lead, updates, { updatedAt: new Date().toISOString() });
    return mockAsQuery(mockClone(lead));
  })
}));

jest.mock('../utils/password.utils', () => ({
  comparePassword: jest.fn(async (plain, hashed) => plain === hashed)
}));

jest.mock('../utils/googleSheets.utils', () => ({
  initializeGoogleSheets: jest.fn(async () => ({ success: true })),
  syncInterestToGoogleSheets: jest.fn(async () => ({ success: true, linkId: 'mock-link-id' })),
  validateSyncPayload: jest.fn(() => [])
}));

jest.mock('../utils/notification.utils', () => ({
  sendBulkEmailNotifications: jest.fn(async () => []),
  buildLeadNotificationTemplate: jest.fn(() => ({ subject: 'Lead', text: 'Lead text' })),
  sendEmailNotification: jest.fn(async () => ({ skipped: true })),
  buildPropertyReviewTemplate: jest.fn(() => ({ subject: 'Review', text: 'Review text' }))
}));

describe('e2e full actions flow', () => {
  let app;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test_secret_key_for_full_actions_flow';
    process.env.JWT_EXPIRE = '7d';

    mockDb.users = [];
    mockDb.properties = [];
    mockDb.interests = [];

    app = express();
    app.use(express.json());

    app.get('/api/v1/health', (req, res) => {
      res.status(200).json({ status: 'OK' });
    });

    app.use('/api/v1/auth', require('../routes/auth.routes'));
    app.use('/api/v1/users', require('../routes/users.routes'));
    app.use('/api/v1/properties', require('../routes/properties.routes'));
    app.use('/api/v1/interests', require('../routes/interests.routes'));
    app.use('/api/v1/admin', require('../routes/admin.routes'));
    app.use('/api/v1/google-sheets', require('../routes/googleSheets.routes'));
  });

  test('covers cross-role actions in one flow', async () => {
    const healthRes = await request(app).get('/api/v1/health');
    expect(healthRes.status).toBe(200);

    const buyerRegisterRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Buyer',
        lastName: 'One',
        email: 'buyer.full@example.com',
        password: 'Buyer@123',
        phone: '9000000001',
        role: 'buyer'
      });
    expect(buyerRegisterRes.status).toBe(201);

    const sellerRegisterRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Seller',
        lastName: 'One',
        email: 'seller.full@example.com',
        password: 'Seller@123',
        phone: '9000000002',
        role: 'seller'
      });
    expect(sellerRegisterRes.status).toBe(201);

    const renterRegisterRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Renter',
        lastName: 'One',
        email: 'renter.full@example.com',
        password: 'Renter@123',
        phone: '9000000003',
        role: 'renter'
      });
    expect(renterRegisterRes.status).toBe(201);

    const adminRegisterBlockedRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Blocked',
        lastName: 'Admin',
        email: 'blocked.admin@example.com',
        password: 'Admin@123',
        phone: '9000000004',
        role: 'admin'
      });
    expect(adminRegisterBlockedRes.status).toBe(403);

    mockDb.users.push({
      _id: mockGenerateId(),
      firstName: 'Admin',
      lastName: 'One',
      email: 'admin.full@example.com',
      password: 'Admin@123',
      phone: '9000000009',
      role: 'admin',
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const buyerLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'buyer.full@example.com', password: 'Buyer@123' });
    expect(buyerLoginRes.status).toBe(200);

    const sellerLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'seller.full@example.com', password: 'Seller@123' });
    expect(sellerLoginRes.status).toBe(200);

    const renterLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'renter.full@example.com', password: 'Renter@123' });
    expect(renterLoginRes.status).toBe(200);

    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin.full@example.com', password: 'Admin@123' });
    expect(adminLoginRes.status).toBe(200);

    const buyerToken = buyerLoginRes.body.token;
    const sellerToken = sellerLoginRes.body.token;
    const renterToken = renterLoginRes.body.token;
    const adminToken = adminLoginRes.body.token;

    const buyerId = buyerLoginRes.body.data.userId;
    const sellerId = sellerLoginRes.body.data.userId;
    const renterId = renterLoginRes.body.data.userId;
    const adminId = adminLoginRes.body.data.userId;

    const verifyRes = await request(app)
      .get('/api/v1/auth/verify')
      .set('Authorization', `Bearer ${sellerToken}`);
    expect(verifyRes.status).toBe(200);

    const buyerMeRes = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${buyerToken}`);
    expect(buyerMeRes.status).toBe(200);

    const buyerUpdateRes = await request(app)
      .put(`/api/v1/users/${buyerId}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ city: 'Delhi', state: 'Delhi' });
    expect(buyerUpdateRes.status).toBe(200);

    const sellerPropertyRes = await request(app)
      .post('/api/v1/properties')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        title: '2BHK Apartment',
        description: 'Prime location',
        propertyType: 'apartment',
        listingType: 'sell',
        price: 5000000,
        address: 'A-12',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        ownerName: 'Seller One',
        contactNumber: '9000000002'
      });
    expect(sellerPropertyRes.status).toBe(201);

    const renterPropertyRes = await request(app)
      .post('/api/v1/properties')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        title: '1BHK Rental Flat',
        description: 'Near metro',
        propertyType: 'apartment',
        listingType: 'rent',
        price: 22000,
        address: 'B-10',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110002',
        ownerName: 'Seller One',
        contactNumber: '9000000002'
      });
    expect(renterPropertyRes.status).toBe(201);

    const sellPropertyId = sellerPropertyRes.body.data._id;
    const rentPropertyId = renterPropertyRes.body.data._id;

    const publicBeforeApprovalRes = await request(app).get('/api/v1/properties');
    expect(publicBeforeApprovalRes.status).toBe(200);
    expect(publicBeforeApprovalRes.body.data).toHaveLength(0);

    const pendingListRes = await request(app)
      .get('/api/v1/admin/properties?status=pending')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(pendingListRes.status).toBe(200);
    expect(pendingListRes.body.data.length).toBe(2);

    const approveSellRes = await request(app)
      .patch(`/api/v1/admin/properties/${sellPropertyId}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approved' });
    expect(approveSellRes.status).toBe(200);

    const approveRentRes = await request(app)
      .patch(`/api/v1/admin/properties/${rentPropertyId}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approved' });
    expect(approveRentRes.status).toBe(200);

    const publicSellFilterRes = await request(app).get('/api/v1/properties?listingType=sell');
    expect(publicSellFilterRes.status).toBe(200);
    expect(publicSellFilterRes.body.data.length).toBe(1);

    const propertyDetailRes = await request(app).get(`/api/v1/properties/${sellPropertyId}`);
    expect(propertyDetailRes.status).toBe(200);

    const buyerInterestRes = await request(app)
      .post('/api/v1/interests')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        name: 'Buyer One',
        mobileNumber: '9000000001',
        email: 'buyer.full@example.com',
        whatsappNumber: '9000000001',
        message: 'I am interested',
        propertyId: sellPropertyId
      });
    expect(buyerInterestRes.status).toBe(201);

    const renterInterestRes = await request(app)
      .post('/api/v1/interests')
      .set('Authorization', `Bearer ${renterToken}`)
      .send({
        name: 'Renter One',
        mobileNumber: '9000000003',
        email: 'renter.full@example.com',
        whatsappNumber: '9000000003',
        message: 'Need rental soon',
        propertyId: rentPropertyId
      });
    expect(renterInterestRes.status).toBe(201);

    const leadId = buyerInterestRes.body.data._id;

    const adminLeadsRes = await request(app)
      .get('/api/v1/interests?status=new')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminLeadsRes.status).toBe(200);
    expect(adminLeadsRes.body.data.length).toBe(2);

    const assignLeadRes = await request(app)
      .patch(`/api/v1/admin/leads/${leadId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ adminId });
    expect(assignLeadRes.status).toBe(200);

    const updateLeadRes = await request(app)
      .patch(`/api/v1/interests/${leadId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'contacted' });
    expect(updateLeadRes.status).toBe(200);

    const closeLeadRes = await request(app)
      .patch(`/api/v1/interests/${leadId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'closed' });
    expect(closeLeadRes.status).toBe(200);

    const buyerMyInterestsRes = await request(app)
      .get('/api/v1/interests/my-interests')
      .set('Authorization', `Bearer ${buyerToken}`);
    expect(buyerMyInterestsRes.status).toBe(200);
    expect(buyerMyInterestsRes.body.data.length).toBe(1);

    const usersListRes = await request(app)
      .get('/api/v1/admin/users?role=seller')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(usersListRes.status).toBe(200);

    const verifySellerRes = await request(app)
      .patch(`/api/v1/admin/users/${sellerId}/verify-seller`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isVerified: true });
    expect(verifySellerRes.status).toBe(200);

    const deactivateRenterRes = await request(app)
      .patch(`/api/v1/admin/users/${renterId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });
    expect(deactivateRenterRes.status).toBe(200);

    const renterReLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'renter.full@example.com', password: 'Renter@123' });
    expect(renterReLoginRes.status).toBe(403);

    const sheetsInitRes = await request(app)
      .post('/api/v1/google-sheets/initialize')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(sheetsInitRes.status).toBe(200);

    const dashboardRes = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(dashboardRes.status).toBe(200);
    expect(dashboardRes.body.data.totalUsers).toBe(4);
    expect(dashboardRes.body.data.totalProperties).toBe(2);
    expect(dashboardRes.body.data.activeListings).toBe(2);
    expect(dashboardRes.body.data.totalLeads).toBe(2);
    expect(dashboardRes.body.data.closedLeads).toBe(1);
  });
});
