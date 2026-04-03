const express = require('express');
const authenticate = require('../middleware/authenticate');
const {
  getProfile,
  updateProfile,
  getMyProfile
} = require('../controllers/users.controller');

const router = express.Router();

router.use(authenticate);

router.get('/me', getMyProfile);
router.get('/:userId', getProfile);
router.put('/:userId', updateProfile);

module.exports = router;
