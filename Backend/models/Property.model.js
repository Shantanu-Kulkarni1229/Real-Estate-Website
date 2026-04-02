/**
 * PROPERTY MODEL TEMPLATE
 * =======================
 * 
 * This is a TEMPLATE showing the schema structure.
 * Will be implemented and tested in next steps.
 * 
 * Purpose:
 * - Store all property listings
 * - Linked to seller (User)
 * - Can be bought or rented
 */

const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    // Seller Information
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller ID is required']
    },

    // Basic Details
    title: {
      type: String,
      required: [true, 'Property title is required'],
      maxlength: [150, 'Title cannot exceed 150 characters']
    },

    description: {
      type: String,
      required: [true, 'Property description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters']
    },

    // Property Classification
    propertyType: {
      type: String,
      enum: {
        values: ['residential', 'commercial', 'land'],
        message: 'Property type must be residential, commercial, or land'
      },
      required: [true, 'Property type is required']
    },

    purpose: {
      type: String,
      enum: {
        values: ['buy', 'rent'],
        message: 'Purpose must be buy or rent'
      },
      required: [true, 'Purpose is required']
    },

    // Location
    address: {
      type: String,
      required: [true, 'Address is required']
    },

    city: {
      type: String,
      required: [true, 'City is required']
    },

    state: {
      type: String,
      required: [true, 'State is required']
    },

    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^[0-9]{6}$/, 'Pincode must be 6 digits']
    },

    // Geographic Coordinates (for map view)
    latitude: Number,
    longitude: Number,

    // Property Specifications
    bedrooms: {
      type: Number,
      min: [0, 'Bedrooms cannot be negative']
    },

    bathrooms: {
      type: Number,
      min: [0, 'Bathrooms cannot be negative']
    },

    area: {
      type: Number,
      required: [true, 'Area is required'],
      min: [100, 'Area must be at least 100 sq.ft']
    },

    // Pricing
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },

    // Rental Information
    rentAmount: {
      type: Number,
      min: [0, 'Rent cannot be negative']
    },

    leaseType: {
      type: String,
      enum: ['furnished', 'unfurnished', 'semi-furnished']
    },

    // Media
    images: {
      type: [String], // Array of image URLs
      validate: {
        validator: function (v) {
          return v.length <= 10; // Max 10 images
        },
        message: 'Maximum 10 images allowed'
      }
    },

    videos: {
      type: [String], // Array of video URLs
      validate: {
        validator: function (v) {
          return v.length <= 5; // Max 5 videos
        },
        message: 'Maximum 5 videos allowed'
      }
    },

    // Status
    status: {
      type: String,
      enum: {
        values: ['active', 'sold', 'inactive'],
        message: 'Status must be active, sold, or inactive'
      },
      default: 'active'
    },

    isFeatured: {
      type: Boolean,
      default: false
    },

    // Interest Tracking
    interestCount: {
      type: Number,
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
    collection: 'properties',
    timestamps: true
  }
);

// Indexes for performance
propertySchema.index({ sellerId: 1 }); // Find properties by seller
propertySchema.index({ city: 1, propertyType: 1 }); // Common filters
propertySchema.index({ price: 1 }); // Sort by price
propertySchema.index({ status: 1 }); // Filter active properties
propertySchema.index({ createdAt: -1 }); // Sort by newest

// Export Model
// Usage: const Property = mongoose.model('Property', propertySchema);
module.exports = mongoose.model('Property', propertySchema);
