const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  recordSearchActivity,
  getSearchActivities
} = require('../controllers/searchActivities.controller');

const router = express.Router();

router.post('/', recordSearchActivity);
router.get('/', authenticate, authorize('admin'), getSearchActivities);

module.exports = router;
