const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Promotion title is required'],
      trim: true,
      minlength: [5, 'Promotion title must be at least 5 characters'],
      maxlength: [100, 'Promotion title cannot exceed 100 characters']
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [180, 'Promotion subtitle cannot exceed 180 characters']
    },
    imageUrl: {
      type: String,
      required: [true, 'Promotion image URL is required'],
      trim: true
    },
    redirectUrl: {
      type: String,
      trim: true,
      default: ''
    },
    days: {
      type: Number,
      required: [true, 'Promotion duration is required'],
      min: [1, 'Promotion duration must be at least 1 day'],
      max: [60, 'Promotion duration cannot exceed 60 days']
    },
    requestedStartDate: {
      type: Date
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    currency: {
      type: String,
      default: 'INR'
    },
    perDayAmount: {
      type: Number,
      required: true,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
      index: true
    },
    razorpayOrderId: {
      type: String,
      trim: true,
      index: true
    },
    razorpayPaymentId: {
      type: String,
      trim: true
    },
    razorpaySignature: {
      type: String,
      trim: true
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    reviewMessage: {
      type: String,
      trim: true,
      maxlength: [500, 'Review message cannot exceed 500 characters']
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    submittedAt: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'promotions'
  }
);

promotionSchema.index({ approvalStatus: 1, paymentStatus: 1, isActive: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Promotion', promotionSchema);