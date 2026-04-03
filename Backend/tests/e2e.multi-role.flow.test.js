const express = require('express');
const request = require('supertest');
const { Types } = require('mongoose');
const { generateToken } = require('../utils/jwt.utils');

const mockDb = {
  users: [],
  properties: [],
  interests: []
};

function mockClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mockCreateQueryChain(items) {
  let result = [...items];

  return {
    select: jest.fn().mockImplementation(function select() {
      return this;
    }),
    sort: jest.fn().mockImplementation(function sort(sortObj = {}) {
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
    }),
    skip: jest.fn().mockImplementation(function skip(count = 0) {
      result = result.slice(count);
      return this;
    }),
    limit: jest.fn().mockImplementation(function limit(count = result.length) {
      result = result.slice(0, count);
      return this;
    }),
    populate: jest.fn().mockImplementation(function populate() {
      return this;
    }),
    lean: jest.fn().mockImplementation(async () => mockClone(result))
  };
}

function mockCreatePopulatable(doc) {
  return {
    populate() {
      return this;
    },
    then(resolve) {
      return resolve(doc);
    }
  };
}

function mockMatchesFilters(item, filters = {}) {
  return Object.entries(filters).every(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return true;
    }

    return String(item[key]) === String(value);
  });
}

function mockGenerateId() {
  return new Types.ObjectId().toString();
}

jest.mock('../models/User.model', () => ({
  findById: jest.fn(async (id) => mockDb.users.find((u) => String(u._id) === String(id)) || null),
  find: jest.fn((filters = {}) => ({
    select: jest.fn(async () => mockDb.users.filter((u) => mockMatchesFilters(u, filters)))
  })),
  countDocuments: jest.fn(async (filters = {}) => mockDb.users.filter((u) => mockMatchesFilters(u, filters)).length),
  findByIdAndUpdate: jest.fn(async (id, updates = {}) => {
    const user = mockDb.users.find((u) => String(u._id) === String(id));
    if (!user) return null;
    Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    return {
      ...mockClone(user),
      select: () => mockClone(user)
    };
  }),
  findOne: jest.fn(async (filters = {}) => mockDb.users.find((u) => mockMatchesFilters(u, filters)) || null)
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
  findById: jest.fn(async (id) => mockDb.properties.find((p) => String(p._id) === String(id)) || null),
  findByIdAndUpdate: jest.fn((id, updates = {}) => {
    const property = mockDb.properties.find((p) => String(p._id) === String(id));
    if (!property) {
      return mockCreatePopulatable(null);
    }

    if (updates.$inc && typeof updates.$inc.viewsCount === 'number') {
      property.viewsCount = (property.viewsCount || 0) + updates.$inc.viewsCount;
    }

    const plainUpdates = { ...updates };
    delete plainUpdates.$inc;
    Object.assign(property, plainUpdates, { updatedAt: new Date().toISOString() });

    return mockCreatePopulatable(mockClone(property));
  }),
  findByIdAndDelete: jest.fn(async (id) => {
    const index = mockDb.properties.findIndex((p) => String(p._id) === String(id));
    if (index < 0) return null;
    const [removed] = mockDb.properties.splice(index, 1);
    return mockClone(removed);
  }),
  find: jest.fn((filters = {}) => mockCreateQueryChain(mockDb.properties.filter((p) => mockMatchesFilters(p, filters)))),
  countDocuments: jest.fn(async (filters = {}) => mockDb.properties.filter((p) => mockMatchesFilters(p, filters)).length)
}));

jest.mock('../models/Interest.model', () => ({
  create: jest.fn(async (payload = {}) => {
    const now = new Date().toISOString();
    const interest = {
      _id: mockGenerateId(),
      createdAt: now,
      updatedAt: now,
      ...payload
    };
    mockDb.interests.push(interest);
    return mockClone(interest);
  }),
  findOne: jest.fn(async (filters = {}) => mockDb.interests.find((i) => mockMatchesFilters(i, filters)) || null),
  find: jest.fn((filters = {}) => mockCreateQueryChain(mockDb.interests.filter((i) => mockMatchesFilters(i, filters)))),
  countDocuments: jest.fn(async (filters = {}) => mockDb.interests.filter((i) => mockMatchesFilters(i, filters)).length),
  findByIdAndUpdate: jest.fn((id, updates = {}) => {
    const interest = mockDb.interests.find((i) => String(i._id) === String(id));
    if (!interest) {
      return mockCreatePopulatable(null);
    }

    Object.assign(interest, updates, { updatedAt: new Date().toISOString() });
    return mockCreatePopulatable(mockClone(interest));
  })
}));

jest.mock('../utils/googleSheets.utils', () => ({
  initializeGoogleSheets: jest.fn(async () => ({ success: true })),
  syncInterestToGoogleSheets: jest.fn(async () => ({ success: true, linkId: 'mock-link' }))
}));

jest.mock('../utils/notification.utils', () => ({
  sendBulkEmailNotifications: jest.fn(async () => []),
  buildLeadNotificationTemplate: jest.fn(() => ({ subject: 'Lead', text: 'Lead text' })),
  sendEmailNotification: jest.fn(async () => ({ skipped: true })),
  buildPropertyReviewTemplate: jest.fn(() => ({ subject: 'Review', text: 'Review text' }))
}));

describe('multi-role e2e flow', () => {
  let app;
  let seller;
  let buyer;
  let admin;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test_secret_key_for_e2e_flow';

    mockDb.users = [];
    mockDb.properties = [];
    mockDb.interests = [];

    seller = {
      _id: new Types.ObjectId().toString(),
      firstName: 'Seller',
      lastName: 'One',
      email: 'seller@example.com',
      phone: '9999999999',
      role: 'seller',
      isActive: true,
      isVerified: true
    };

    buyer = {
      _id: new Types.ObjectId().toString(),
      firstName: 'Buyer',
      lastName: 'One',
      email: 'buyer@example.com',
      phone: '8888888888',
      role: 'buyer',
      isActive: true,
      isVerified: true
    };

    admin = {
      _id: new Types.ObjectId().toString(),
      firstName: 'Admin',
      lastName: 'One',
      email: 'admin@example.com',
      phone: '7777777777',
      role: 'admin',
      isActive: true,
      isVerified: true
    };

    mockDb.users.push(seller, buyer, admin);

    app = express();
    app.use(express.json());
    app.use('/api/v1/properties', require('../routes/properties.routes'));
    app.use('/api/v1/interests', require('../routes/interests.routes'));
    app.use('/api/v1/admin', require('../routes/admin.routes'));
  });

  test('seller -> admin approval -> buyer interest -> admin closes lead', async () => {
    const sellerToken = generateToken({ userId: seller._id, email: seller.email, role: 'seller' });
    const buyerToken = generateToken({ userId: buyer._id, email: buyer.email, role: 'buyer' });
    const adminToken = generateToken({ userId: admin._id, email: admin.email, role: 'admin' });

    const createPropertyRes = await request(app)
      .post('/api/v1/properties')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        title: '2BHK Apartment',
        description: 'Prime location',
        propertyType: 'apartment',
        listingType: 'sell',
        price: 5000000,
        address: 'A-12 Street',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        ownerName: 'Seller One',
        contactNumber: '9999999999'
      });

    expect(createPropertyRes.status).toBe(201);
    expect(createPropertyRes.body.data.status).toBe('pending');

    const propertyId = createPropertyRes.body.data._id;

    const beforeApprovalInterestRes = await request(app)
      .post('/api/v1/interests')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        name: 'Buyer One',
        mobileNumber: '8888888888',
        email: 'buyer@example.com',
        whatsappNumber: '8888888888',
        message: 'Interested before approval',
        propertyId
      });

    expect(beforeApprovalInterestRes.status).toBe(404);

    const reviewRes = await request(app)
      .patch(`/api/v1/admin/properties/${propertyId}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approved' });

    expect(reviewRes.status).toBe(200);
    expect(reviewRes.body.data.status).toBe('approved');

    const createInterestRes = await request(app)
      .post('/api/v1/interests')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        name: 'Buyer One',
        mobileNumber: '8888888888',
        email: 'buyer@example.com',
        whatsappNumber: '8888888888',
        message: 'Interested after approval',
        propertyId
      });

    expect(createInterestRes.status).toBe(201);
    expect(createInterestRes.body.data.status).toBe('new');

    const leadId = createInterestRes.body.data._id;

    const assignLeadRes = await request(app)
      .patch(`/api/v1/admin/leads/${leadId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ adminId: admin._id });

    expect(assignLeadRes.status).toBe(200);
    expect(assignLeadRes.body.data.assignedToAdmin).toBe(admin._id);

    const contactedRes = await request(app)
      .patch(`/api/v1/interests/${leadId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'contacted' });

    expect(contactedRes.status).toBe(200);
    expect(contactedRes.body.data.status).toBe('contacted');

    const closedRes = await request(app)
      .patch(`/api/v1/interests/${leadId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'closed' });

    expect(closedRes.status).toBe(200);
    expect(closedRes.body.data.status).toBe('closed');

    const myInterestsRes = await request(app)
      .get('/api/v1/interests/my-interests')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(myInterestsRes.status).toBe(200);
    expect(myInterestsRes.body.data).toHaveLength(1);

    const dashboardRes = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(dashboardRes.status).toBe(200);
    expect(dashboardRes.body.data.totalUsers).toBe(3);
    expect(dashboardRes.body.data.totalProperties).toBe(1);
    expect(dashboardRes.body.data.activeListings).toBe(1);
    expect(dashboardRes.body.data.totalLeads).toBe(1);
    expect(dashboardRes.body.data.closedLeads).toBe(1);
    expect(dashboardRes.body.data.conversionRate).toBe(100);
  });
});
