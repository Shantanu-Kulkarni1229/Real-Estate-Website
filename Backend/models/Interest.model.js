const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },

    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property ID is required'],
      index: true
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller ID is required'],
      index: true
    },

    name: {
      type: String,
      required: [true, 'Name is required']
    },

    email: {
      type: String,
      validate: {
        validator: function validateEmail(value) {
          if (!value) return true;
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
        },
        message: 'Please provide a valid email'
      }
    },

    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      match: [/^[0-9]{10}$/, 'Mobile must be 10 digits']
    },

    whatsapp: {
      type: String,
      match: [/^[0-9]{10}$/, 'WhatsApp number must be 10 digits']
    },

    message: {
      type: String,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },

    status: {
      type: String,
      enum: ['new', 'contacted', 'closed'],
      default: 'new',
      index: true
    },

    sourceType: {
      type: String,
      enum: ['authenticated', 'public'],
      default: 'public',
      index: true
    },

    assignedToAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    collection: 'interests',
    timestamps: true
  }
);

interestSchema.index(
  { buyerId: 1, propertyId: 1 },
  {
    unique: true,
    partialFilterExpression: { buyerId: { $exists: true } }
  }
);

interestSchema.index(
  { propertyId: 1, mobile: 1, sourceType: 1 },
  {
    unique: true,
    partialFilterExpression: { sourceType: 'public' }
  }
);

interestSchema.index({ createdAt: -1 });
interestSchema.index({ assignedToAdmin: 1 });

module.exports = mongoose.model('Interest', interestSchema);
