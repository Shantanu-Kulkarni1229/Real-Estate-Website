const crypto = require('crypto');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const Promotion = require('../models/Promotion.model');
const SubscriptionFeeConfig = require('../models/SubscriptionFeeConfig.model');
const { sendEmailNotification } = require('../utils/notification.utils');

const PROMOTION_ALLOWED_ROLES = ['owner', 'agent', 'builder', 'seller'];

function normalizeRole(role) {
  return String(role || '').trim().toLowerCase() === 'seller' ? 'owner' : String(role || '').trim().toLowerCase();
}

function getRazorpayClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

async function getPromotionPricing() {
  const config = await SubscriptionFeeConfig.findOne({ key: 'default' }).lean();
  const perDayAmount = Number(config?.promotion?.perDayAmount || 0);
  return {
    currency: config?.promotion?.currency || 'INR',
    perDayAmount: Number.isFinite(perDayAmount) && perDayAmount >= 0 ? perDayAmount : 0
  };
}

function ensureCommercialRole(req, res) {
  const userRole = normalizeRole(req?.user?.role);
  if (!PROMOTION_ALLOWED_ROLES.includes(userRole)) {
    res.status(403).json({
      success: false,
      message: 'Only owner, agent, and builder accounts can create promotions'
    });
    return false;
  }

  return true;
}

function buildApprovalEmailTemplate({ name, title, startDate, endDate, approved, reviewMessage }) {
  if (!approved) {
    return {
      subject: `Promotion update for ${title}`,
      text: [
        `Hi ${name},`,
        '',
        `Your promotion \"${title}\" was reviewed and not approved at this time.`,
        reviewMessage ? `Admin note: ${reviewMessage}` : '',
        '',
        'You can update your creative and submit a new campaign from your dashboard.',
        '',
        'Regards,',
        'CityPloter Team'
      ].filter(Boolean).join('\n')
    };
  }

  return {
    subject: `Promotion approved: ${title}`,
    text: [
      `Hi ${name},`,
      '',
      `Your promotion \"${title}\" is approved and now scheduled on the homepage hero section.`,
      `Campaign window: ${new Date(startDate).toLocaleDateString('en-IN')} to ${new Date(endDate).toLocaleDateString('en-IN')}`,
      reviewMessage ? `Admin note: ${reviewMessage}` : '',
      '',
      'Regards,',
      'CityPloter Team'
    ].filter(Boolean).join('\n')
  };
}

async function createPromotionOrder(req, res) {
  if (!ensureCommercialRole(req, res)) {
    return;
  }

  const { title, subtitle = '', imageUrl, redirectUrl = '', days, requestedStartDate } = req.body || {};
  const durationDays = Number(days);

  if (!title || String(title).trim().length < 5) {
    return res.status(400).json({ success: false, message: 'Promotion title must be at least 5 characters' });
  }

  if (!imageUrl || typeof imageUrl !== 'string') {
    return res.status(400).json({ success: false, message: 'Promotion image URL is required' });
  }

  if (!Number.isFinite(durationDays) || durationDays < 1 || durationDays > 60) {
    return res.status(400).json({ success: false, message: 'Promotion days must be between 1 and 60' });
  }

  try {
    const pricing = await getPromotionPricing();
    if (pricing.perDayAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Promotion pricing is not configured. Please contact admin.'
      });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
      });
    }

    const totalAmount = Number((pricing.perDayAmount * durationDays).toFixed(2));
    const amountInPaise = Math.round(totalAmount * 100);

    const promotion = await Promotion.create({
      createdBy: req.user.userId,
      title: String(title).trim(),
      subtitle: String(subtitle || '').trim(),
      imageUrl: String(imageUrl).trim(),
      redirectUrl: String(redirectUrl || '').trim(),
      days: durationDays,
      requestedStartDate: requestedStartDate ? new Date(requestedStartDate) : undefined,
      currency: pricing.currency,
      perDayAmount: pricing.perDayAmount,
      totalAmount,
      paymentStatus: 'pending',
      approvalStatus: 'pending'
    });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: pricing.currency,
      receipt: `promo_${promotion._id}`,
      notes: {
        promotionId: String(promotion._id),
        userId: String(req.user.userId)
      }
    });

    promotion.razorpayOrderId = order.id;
    await promotion.save();

    return res.status(201).json({
      success: true,
      message: 'Promotion order created successfully',
      data: {
        promotionId: promotion._id,
        orderId: order.id,
        amount: totalAmount,
        currency: pricing.currency,
        perDayAmount: pricing.perDayAmount,
        days: durationDays,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create promotion order'
    });
  }
}

async function verifyPromotionPayment(req, res) {
  if (!ensureCommercialRole(req, res)) {
    return;
  }

  const { promotionId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

  if (!promotionId || !mongoose.Types.ObjectId.isValid(promotionId)) {
    return res.status(400).json({ success: false, message: 'Invalid promotionId' });
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: 'razorpay_order_id, razorpay_payment_id and razorpay_signature are required'
    });
  }

  try {
    const promotion = await Promotion.findOne({ _id: promotionId, createdBy: req.user.userId });
    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }

    if (promotion.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: 'Razorpay order id mismatch' });
    }

    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated !== razorpay_signature) {
      promotion.paymentStatus = 'failed';
      await promotion.save();
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    promotion.paymentStatus = 'paid';
    promotion.razorpayPaymentId = razorpay_payment_id;
    promotion.razorpaySignature = razorpay_signature;
    promotion.submittedAt = new Date();
    promotion.approvalStatus = 'pending';
    await promotion.save();

    return res.status(200).json({
      success: true,
      message: 'Payment verified. Promotion submitted for admin approval.',
      data: promotion
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to verify promotion payment' });
  }
}

async function listMyPromotions(req, res) {
  if (!ensureCommercialRole(req, res)) {
    return;
  }

  try {
    const items = await Promotion.find({ createdBy: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch promotions' });
  }
}

async function listActivePromotions(req, res) {
  const now = new Date();

  try {
    const items = await Promotion.find({
      paymentStatus: 'paid',
      approvalStatus: 'approved',
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
      .sort({ approvedAt: -1 })
      .limit(8)
      .select('title subtitle imageUrl redirectUrl startDate endDate days')
      .lean();

    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch active promotions' });
  }
}

async function getPromotionPricingPublic(req, res) {
  try {
    const pricing = await getPromotionPricing();
    return res.status(200).json({
      success: true,
      data: pricing
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch promotion pricing' });
  }
}

async function getPromotionsForReview(req, res) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
  const filters = {};

  if (req.query.approvalStatus && ['pending', 'approved', 'rejected'].includes(req.query.approvalStatus)) {
    filters.approvalStatus = req.query.approvalStatus;
  }

  if (req.query.paymentStatus && ['pending', 'paid', 'failed'].includes(req.query.paymentStatus)) {
    filters.paymentStatus = req.query.paymentStatus;
  }

  try {
    const [items, total] = await Promise.all([
      Promotion.find(filters)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('createdBy', 'firstName lastName email phone businessName role')
        .populate('approvedBy', 'firstName lastName email')
        .lean(),
      Promotion.countDocuments(filters)
    ]);

    return res.status(200).json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch promotions for review' });
  }
}

async function reviewPromotion(req, res) {
  const { promotionId } = req.params;
  const { status, reviewMessage = '' } = req.body || {};

  if (!promotionId || !mongoose.Types.ObjectId.isValid(promotionId)) {
    return res.status(400).json({ success: false, message: 'Invalid promotion ID' });
  }

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'status must be approved or rejected' });
  }

  if (status === 'rejected' && !String(reviewMessage || '').trim()) {
    return res.status(400).json({ success: false, message: 'reviewMessage is required when rejecting a promotion' });
  }

  try {
    const promotion = await Promotion.findById(promotionId).populate('createdBy', 'firstName lastName email');
    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }

    if (promotion.paymentStatus !== 'paid') {
      return res.status(400).json({ success: false, message: 'Only paid promotions can be reviewed' });
    }

    promotion.approvalStatus = status;
    promotion.reviewMessage = String(reviewMessage || '').trim();
    promotion.approvedBy = req.user.userId;
    promotion.approvedAt = new Date();

    if (status === 'approved') {
      const baseStart = promotion.requestedStartDate && promotion.requestedStartDate > new Date()
        ? promotion.requestedStartDate
        : new Date();

      const startDate = new Date(baseStart);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.max(1, Number(promotion.days || 1)) - 1);
      endDate.setHours(23, 59, 59, 999);

      promotion.startDate = startDate;
      promotion.endDate = endDate;
      promotion.isActive = true;
    } else {
      promotion.startDate = undefined;
      promotion.endDate = undefined;
      promotion.isActive = false;
    }

    await promotion.save();

    try {
      const recipient = promotion?.createdBy?.email;
      if (recipient) {
        const name = `${promotion.createdBy.firstName || ''} ${promotion.createdBy.lastName || ''}`.trim() || 'User';
        const template = buildApprovalEmailTemplate({
          name,
          title: promotion.title,
          startDate: promotion.startDate,
          endDate: promotion.endDate,
          approved: status === 'approved',
          reviewMessage: promotion.reviewMessage
        });

        await sendEmailNotification({
          to: recipient,
          subject: template.subject,
          text: template.text
        });
      }
    } catch (emailError) {
      console.warn('Promotion review notification failed:', emailError.message);
    }

    return res.status(200).json({
      success: true,
      message: `Promotion ${status} successfully`,
      data: promotion
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to review promotion' });
  }
}

async function getPromotionFeeConfig(req, res) {
  try {
    let config = await SubscriptionFeeConfig.findOne({ key: 'default' }).lean();

    if (!config) {
      const created = await SubscriptionFeeConfig.create({ key: 'default' });
      config = created.toObject();
    }

    return res.status(200).json({
      success: true,
      data: {
        currency: config?.promotion?.currency || 'INR',
        perDayAmount: Number(config?.promotion?.perDayAmount || 0),
        updatedAt: config.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch promotion fee config' });
  }
}

async function updatePromotionFeeConfig(req, res) {
  const perDayAmount = Number(req.body?.perDayAmount);
  const currency = String(req.body?.currency || 'INR').trim().toUpperCase() || 'INR';

  if (!Number.isFinite(perDayAmount) || perDayAmount < 0) {
    return res.status(400).json({ success: false, message: 'perDayAmount must be a non-negative number' });
  }

  try {
    const config = await SubscriptionFeeConfig.findOneAndUpdate(
      { key: 'default' },
      {
        $set: {
          'promotion.perDayAmount': perDayAmount,
          'promotion.currency': currency,
          updatedBy: req.user.userId
        }
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true
      }
    ).lean();

    return res.status(200).json({
      success: true,
      message: 'Promotion daily fee updated successfully',
      data: {
        currency: config?.promotion?.currency || 'INR',
        perDayAmount: Number(config?.promotion?.perDayAmount || 0),
        updatedAt: config.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update promotion fee config' });
  }
}

module.exports = {
  createPromotionOrder,
  verifyPromotionPayment,
  listMyPromotions,
  listActivePromotions,
  getPromotionPricingPublic,
  getPromotionsForReview,
  reviewPromotion,
  getPromotionFeeConfig,
  updatePromotionFeeConfig
};