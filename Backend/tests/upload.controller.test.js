jest.mock('../utils/cloudinary.utils', () => ({
  uploadPropertyImage: jest.fn()
}));

const { uploadPropertyImage } = require('../utils/cloudinary.utils');
const { uploadPropertyImagesController } = require('../controllers/upload.controller');

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
}

describe('upload.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 400 when no files are provided', async () => {
    const req = { files: [] };
    const res = createMockRes();

    await uploadPropertyImagesController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'At least one image file is required'
      })
    );
  });

  test('uploads multiple images successfully', async () => {
    const req = {
      files: [
        { buffer: Buffer.from('image-a'), originalname: 'a.jpg' },
        { buffer: Buffer.from('image-b'), originalname: 'b.jpg' }
      ]
    };
    const res = createMockRes();

    uploadPropertyImage
      .mockResolvedValueOnce({ url: 'https://cloudinary.test/a.jpg', publicId: 'a' })
      .mockResolvedValueOnce({ url: 'https://cloudinary.test/b.jpg', publicId: 'b' });

    await uploadPropertyImagesController(req, res);

    expect(uploadPropertyImage).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Property images uploaded successfully'
      })
    );
  });
});
