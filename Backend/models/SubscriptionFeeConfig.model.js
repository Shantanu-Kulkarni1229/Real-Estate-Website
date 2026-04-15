const mongoose = require('mongoose');

const subscriptionFeeConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'default',
      unique: true,
      trim: true
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true
    },
    fees: {
      owner: {
        type: Number,
        min: 0,
        default: 0
      },
      agent: {
        type: Number,
        min: 0,
        default: 1999
      },
      builder: {
        type: Number,
        min: 0,
        default: 2999
      }
    },
    promotion: {
      perDayAmount: {
        type: Number,
        min: 0,
        default: 1500
      },
      currency: {
        type: String,
        default: 'INR',
        trim: true
      }
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    collection: 'subscription_fee_configs',
    timestamps: true
  }
);

module.exports = mongoose.model('SubscriptionFeeConfig', subscriptionFeeConfigSchema);