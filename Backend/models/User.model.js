/**
 * USER MODEL TEMPLATE
 * ===================
 * 
 * This is a TEMPLATE showing the schema structure.
 * Will be implemented and tested in next steps.
 * 
 * Roles:
 * - admin: Full access
 * - seller: Can list properties
 * - buyer: Can browse & mark interest
 * - renter: Can browse rentals & mark interest
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters']
    },

    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters']
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't return password in queries by default
    },

    // Contact Information
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },

    whatsappNumber: {
      type: String,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit WhatsApp number']
    },

    // Role & Permissions
    role: {
      type: String,
      enum: {
        values: ['buyer', 'seller', 'renter', 'admin'],
        message: 'Role must be buyer, seller, renter, or admin'
      },
      default: 'buyer'
    },

    // Address
    address: String,
    city: String,
    state: String,
    pincode: String,

    // Profile
    profileImage: String, // URL to image
    isVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },

    // Seller Specific
    businessName: String, // Only for sellers
    sellerRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'users',
    timestamps: true
  }
);

// 🔒 SECURITY: Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash if password is new or modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Indexes for performance
userSchema.index({ email: 1 }); // Email lookup should be fast
userSchema.index({ role: 1 }); // Filter by role
userSchema.index({ city: 1 }); // Filter by city

// Export Model
// Usage: const User = mongoose.model('User', userSchema);
module.exports = mongoose.model('User', userSchema);
