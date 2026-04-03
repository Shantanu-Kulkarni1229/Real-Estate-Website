const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  uploadPropertyImagesController,
  uploadPropertyImageMiddleware,
  handleMulterError
} = require('../controllers/upload.controller');

const router = express.Router();

router.use(authenticate);
router.use(authorize('seller', 'admin'));

router.post('/property-images', uploadPropertyImageMiddleware.array('images', 10), (req, res) => {
  const uploadError = handleMulterError(req.fileValidationError, res);
  if (uploadError) {
    return uploadError;
  }

  return uploadPropertyImagesController(req, res);
});

module.exports = router;
