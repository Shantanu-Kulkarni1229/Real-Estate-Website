const express = require('express');
const authenticate = require('../middleware/authenticate');
const {
  createPromotionOrder,
  verifyPromotionPayment,
  listMyPromotions,
  listActivePromotions,
  getPromotionPricingPublic
} = require('../controllers/promotions.controller');

const router = express.Router();

router.get('/active', listActivePromotions);
router.get('/pricing', getPromotionPricingPublic);

router.use(authenticate);
router.get('/my', listMyPromotions);
router.post('/create-order', createPromotionOrder);
router.post('/verify-payment', verifyPromotionPayment);

module.exports = router;