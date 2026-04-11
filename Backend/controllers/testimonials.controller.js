const Testimonial = require('../models/Testimonial.model');
const User = require('../models/User.model');

function buildDisplayName(userDoc, requestedDisplayName) {
  const fromRequest = String(requestedDisplayName || '').trim();
  if (fromRequest) {
    return fromRequest;
  }

  const fullName = [userDoc?.firstName, userDoc?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  return fullName || 'CityPloter User';
}

function normalizeRating(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.round(parsed);
}

function buildSummary(testimonials) {
  const totalReviews = testimonials.length;
  if (totalReviews === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      }
    };
  }

  const ratingDistribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  };

  let ratingTotal = 0;
  testimonials.forEach((item) => {
    const star = Number(item.rating);
    if (ratingDistribution[star] !== undefined) {
      ratingDistribution[star] += 1;
    }
    ratingTotal += star;
  });

  const averageRating = Number((ratingTotal / totalReviews).toFixed(1));

  return {
    totalReviews,
    averageRating,
    ratingDistribution
  };
}

async function getTestimonials(req, res) {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '12', 10), 1), 100);

    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      data: testimonials,
      summary: buildSummary(testimonials)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to load testimonials'
    });
  }
}

async function upsertTestimonial(req, res) {
  const rating = normalizeRating(req.body?.rating);
  const reviewText = String(req.body?.reviewText || '').trim();

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be a whole number between 1 and 5'
    });
  }

  if (reviewText.length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Review should be at least 10 characters'
    });
  }

  try {
    const userDoc = await User.findById(req.user.userId).select('firstName lastName city role');
    const displayName = buildDisplayName(userDoc, req.body?.displayName);

    const payload = {
      displayName,
      role: req.user.role,
      city: String(req.body?.city || userDoc?.city || '').trim(),
      rating,
      reviewText,
      isActive: true
    };

    const existing = await Testimonial.findOne({ userId: req.user.userId });

    if (existing) {
      existing.displayName = payload.displayName;
      existing.role = payload.role;
      existing.city = payload.city;
      existing.rating = payload.rating;
      existing.reviewText = payload.reviewText;
      existing.isActive = true;

      const updated = await existing.save();

      return res.status(200).json({
        success: true,
        message: 'Testimonial updated successfully',
        data: updated
      });
    }

    const created = await Testimonial.create({
      userId: req.user.userId,
      ...payload
    });

    return res.status(201).json({
      success: true,
      message: 'Testimonial submitted successfully',
      data: created
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit testimonial'
    });
  }
}

module.exports = {
  getTestimonials,
  upsertTestimonial
};
