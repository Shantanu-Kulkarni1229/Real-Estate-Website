const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  getDashboardStats,
  getPropertiesForReview,
  reviewProperty,
  getUsers,
  updateUserStatus,
  verifySeller,
  assignLead,
  sendLeadEmail,
  deleteLead,
  getSubscriptionFees,
  updateSubscriptionFees
} = require('../controllers/admin.controller');
const {
  getPromotionFeeConfig,
  updatePromotionFeeConfig,
  getPromotionsForReview,
  reviewPromotion
} = require('../controllers/promotions.controller');

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);

router.get('/users', getUsers);
router.patch('/users/:userId/status', updateUserStatus);
router.patch('/users/:userId/verify-seller', verifySeller);

router.get('/properties', getPropertiesForReview);
router.patch('/properties/:propertyId/review', reviewProperty);

router.patch('/leads/:leadId/assign', assignLead);
router.post('/leads/:leadId/send-email', sendLeadEmail);
router.delete('/leads/:leadId', deleteLead);

router.get('/subscription-fees', getSubscriptionFees);
router.put('/subscription-fees', updateSubscriptionFees);
router.get('/promotion-fees', getPromotionFeeConfig);
router.put('/promotion-fees', updatePromotionFeeConfig);

router.get('/promotions', getPromotionsForReview);
router.patch('/promotions/:promotionId/review', reviewPromotion);

module.exports = router;
