jest.mock('../models/Testimonial.model', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn()
}));

jest.mock('../models/User.model', () => ({
  findById: jest.fn()
}));

const Testimonial = require('../models/Testimonial.model');
const User = require('../models/User.model');
const {
  getTestimonials,
  upsertTestimonial
} = require('../controllers/testimonials.controller');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
}

describe('testimonials.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getTestimonials should return list and summary', async () => {
    const req = { query: { limit: '10' } };
    const res = createRes();

    const chain = {
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([
        { rating: 5 },
        { rating: 4 },
        { rating: 4 }
      ])
    };

    Testimonial.find.mockReturnValue(chain);

    await getTestimonials(req, res);

    expect(Testimonial.find).toHaveBeenCalledWith({ isActive: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        summary: expect.objectContaining({
          totalReviews: 3,
          averageRating: 4.3
        })
      })
    );
  });

  test('upsertTestimonial should reject invalid rating', async () => {
    const req = {
      body: { rating: 6, reviewText: 'Nice platform and support team' },
      user: { userId: 'u1', role: 'buyer' }
    };
    const res = createRes();

    await upsertTestimonial(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('upsertTestimonial should create testimonial', async () => {
    const req = {
      body: { rating: 5, reviewText: 'Excellent property support and quick response.' },
      user: { userId: 'u1', role: 'buyer' }
    };
    const res = createRes();

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ firstName: 'Shantanu', lastName: 'K', city: 'Pune' })
    });
    Testimonial.findOne.mockResolvedValue(null);
    Testimonial.create.mockResolvedValue({ _id: 't1', rating: 5 });

    await upsertTestimonial(req, res);

    expect(Testimonial.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u1',
        rating: 5,
        displayName: 'Shantanu K'
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('upsertTestimonial should update existing testimonial', async () => {
    const req = {
      body: { rating: 4, reviewText: 'Very good experience with transparent communication.' },
      user: { userId: 'u1', role: 'seller' }
    };
    const res = createRes();

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ firstName: 'Demo', lastName: 'User', city: 'Delhi' })
    });

    const existing = {
      displayName: '',
      role: 'buyer',
      city: '',
      rating: 1,
      reviewText: '',
      isActive: false,
      save: jest.fn().mockResolvedValue({ _id: 't1', rating: 4 })
    };

    Testimonial.findOne.mockResolvedValue(existing);

    await upsertTestimonial(req, res);

    expect(existing.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
