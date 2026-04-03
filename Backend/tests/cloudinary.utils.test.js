jest.mock('../config/cloudinary', () => ({
  configureCloudinary: jest.fn(() => ({
    uploader: {
      upload_stream: jest.fn((options, callback) => {
        const stream = require('stream').PassThrough();
        stream.on('finish', () => {
          callback(null, {
            public_id: 'sample-public-id',
            secure_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
            original_filename: 'sample',
            width: 1200,
            height: 900,
            bytes: 12345
          });
        });
        return stream;
      })
    }
  }))
}));

const {
  getUploadFolder,
  getThumbnailFolder,
  uploadPropertyImage
} = require('../utils/cloudinary.utils');

describe('cloudinary.utils', () => {
  beforeEach(() => {
    delete process.env.CLOUDINARY_PROPERTY_FOLDER;
    delete process.env.CLOUDINARY_PROPERTY_THUMBNAIL_FOLDER;
  });

  test('returns default folders when env is missing', () => {
    expect(getUploadFolder()).toBe('real-estate/properties');
    expect(getThumbnailFolder()).toBe('real-estate/properties/thumbnails');
  });

  test('uses env configured folders', () => {
    process.env.CLOUDINARY_PROPERTY_FOLDER = 'custom/properties';
    process.env.CLOUDINARY_PROPERTY_THUMBNAIL_FOLDER = 'custom/thumbs';

    expect(getUploadFolder()).toBe('custom/properties');
    expect(getThumbnailFolder()).toBe('custom/thumbs');
  });

  test('uploads property image and returns normalized metadata', async () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'demo';
    process.env.CLOUDINARY_API_KEY = 'key';
    process.env.CLOUDINARY_API_SECRET = 'secret';

    const result = await uploadPropertyImage(Buffer.from('image-bytes'), 'sample.jpg');

    expect(result).toEqual(
      expect.objectContaining({
        publicId: 'sample-public-id',
        url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        originalName: 'sample.jpg',
        width: 1200,
        height: 900,
        bytes: 12345
      })
    );
  });
});
