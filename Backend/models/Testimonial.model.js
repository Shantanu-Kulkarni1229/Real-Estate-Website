const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [80, 'Display name cannot exceed 80 characters']
    },
    role: {
      type: String,
      enum: ['buyer', 'renter', 'owner', 'agent', 'builder', 'admin', 'seller'],
      required: true
    },
    city: {
      type: String,
      trim: true,
      maxlength: [80, 'City cannot exceed 80 characters']
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    reviewText: {
      type: String,
      required: true,
      trim: true,
      minlength: [10, 'Review should be at least 10 characters'],
      maxlength: [800, 'Review cannot exceed 800 characters']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    collection: 'testimonials',
    timestamps: true
  }
);

testimonialSchema.index({ isActive: 1, createdAt: -1 });
testimonialSchema.index({ rating: -1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);
