jest.mock('../models/User.model', () => ({
  findOne: jest.fn(),
  create: jest.fn()
}));

jest.mock('../utils/jwt.utils', () => ({
  generateToken: jest.fn(() => 'mock-token')
}));

jest.mock('../utils/password.utils', () => ({
  comparePassword: jest.fn()
}));

const User = require('../models/User.model');
const { comparePassword } = require('../utils/password.utils');
const { register, login, verify } = require('../controllers/auth.controller');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
}

describe('auth.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('register should return 400 for missing fields', async () => {
    const req = { body: { email: 'a@b.com' } };
    const res = createRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('register should return 409 if email exists', async () => {
    const req = {
      body: {
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.com',
        password: 'secret123',
        phone: '9999999999'
      }
    };
    const res = createRes();

    User.findOne.mockResolvedValue({ _id: 'existing' });

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  test('register should block admin creation from API', async () => {
    const req = {
      body: {
        firstName: 'A',
        lastName: 'B',
        email: 'admin@x.com',
        password: 'secret123',
        phone: '9999999999',
        role: 'admin'
      }
    };
    const res = createRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(User.findOne).not.toHaveBeenCalled();
  });

  test('login should return 401 on wrong password', async () => {
    const req = { body: { email: 'a@b.com', password: 'wrong' } };
    const res = createRes();

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'u1',
        email: 'a@b.com',
        password: 'hashed',
        role: 'buyer',
        isActive: true
      })
    });
    comparePassword.mockResolvedValue(false);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('verify should return decoded user payload', async () => {
    const req = { user: { userId: 'u1', email: 'a@b.com', role: 'buyer' } };
    const res = createRes();

    await verify(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          userId: 'u1',
          role: 'buyer'
        })
      })
    );
  });
});
