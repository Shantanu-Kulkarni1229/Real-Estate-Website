const multer = require('multer');

const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'), false);
  }

  cb(null, true);
};

const uploadPropertyImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10
  }
});

module.exports = uploadPropertyImage;
