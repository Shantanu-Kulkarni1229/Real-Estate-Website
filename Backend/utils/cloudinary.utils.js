const { Readable } = require('stream');
const streamifier = require('streamifier');
const { configureCloudinary } = require('../config/cloudinary');

function getUploadFolder() {
  return process.env.CLOUDINARY_PROPERTY_FOLDER || 'real-estate/properties';
}

function getThumbnailFolder() {
  return process.env.CLOUDINARY_PROPERTY_THUMBNAIL_FOLDER || 'real-estate/properties/thumbnails';
}

function uploadBufferToCloudinary(buffer, options = {}) {
  const cloudinary = configureCloudinary();
  const folder = options.folder || getUploadFolder();
  const resourceType = options.resourceType || 'image';

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        transformation: options.transformation
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

async function uploadPropertyImage(buffer, fileName) {
  const result = await uploadBufferToCloudinary(buffer, {
    folder: getUploadFolder(),
    resourceType: 'image',
    transformation: [
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  });

  return {
    publicId: result.public_id,
    url: result.secure_url,
    originalName: fileName || result.original_filename,
    width: result.width,
    height: result.height,
    bytes: result.bytes
  };
}

async function uploadPropertyThumbnail(buffer, fileName) {
  const result = await uploadBufferToCloudinary(buffer, {
    folder: getThumbnailFolder(),
    resourceType: 'image',
    transformation: [
      { width: 400, height: 300, crop: 'fill' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  });

  return {
    publicId: result.public_id,
    url: result.secure_url,
    originalName: fileName || result.original_filename,
    width: result.width,
    height: result.height,
    bytes: result.bytes
  };
}

module.exports = {
  getUploadFolder,
  getThumbnailFolder,
  uploadBufferToCloudinary,
  uploadPropertyImage,
  uploadPropertyThumbnail
};
