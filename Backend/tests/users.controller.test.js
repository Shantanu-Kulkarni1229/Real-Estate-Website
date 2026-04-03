jest.mock('../models/User.model', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));

const User = require('../models/User.model');
const {
  getProfile,
  updateProfile,
  getMyProfile,
  canAccessUserProfile
} = require('../controllers/users.controller');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
}

describe('users.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('canAccessUserProfile allows admin', () => {
    expect(canAccessUserProfile({ userId: 'a', role: 'admin' }, 'b')).toBe(true);
  });

  test('getProfile blocks unauthorized access', async () => {
    const req = {
      params: { userId: 'u2' },
      user: { userId: 'u1', role: 'buyer' }
    };
    const res = createRes();

    await getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('updateProfile updates allowed fields', async () => {
    const req = {
      params: { userId: 'u1' },
      user: { userId: 'u1', role: 'buyer' },
      body: {
        firstName: 'NewName',
        city: 'Delhi',
        role: 'admin'
      }
    };
    const res = createRes();

    User.findByIdAndUpdate.mockResolvedValue({
      _id: 'u1',
      firstName: 'NewName',
      lastName: 'Doe',
      email: 'x@y.com',
      phone: '9999999999',
      role: 'buyer'
    });

    await updateProfile(req, res);

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({ firstName: 'NewName', city: 'Delhi' }),
      expect.any(Object)
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('getMyProfile returns profile', async () => {
    const req = { user: { userId: 'u1' } };
    const res = createRes();

    User.findById.mockResolvedValue({
      _id: 'u1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '9999999999',
      role: 'buyer'
    });

    await getMyProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
