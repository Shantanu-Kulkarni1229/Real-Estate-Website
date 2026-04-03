const uploadPropertyImageMiddleware = require('../middleware/uploadPropertyImage');
const {
  uploadPropertyImage
} = require('../utils/cloudinary.utils');

function handleMulterError(error, res) {
  if (!error) {
    return false;
  }

  return res.status(400).json({
    success: false,
    message: error.message || 'File upload failed'
  });
}

async function uploadPropertyImagesController(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one image file is required'
      });
    }

    const uploads = [];
    for (const file of req.files) {
      const uploaded = await uploadPropertyImage(file.buffer, file.originalname);
      uploads.push(uploaded);
    }

    return res.status(201).json({
      success: true,
      message: 'Property images uploaded successfully',
      data: uploads
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload property images'
    });
  }
}

module.exports = {
  handleMulterError,
  uploadPropertyImagesController,
  uploadPropertyImageMiddleware
};
