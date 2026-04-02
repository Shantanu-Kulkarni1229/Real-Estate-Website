/**
 * INTEREST MODEL TEMPLATE (Leads)
 * ===============================
 * 
 * This is a TEMPLATE showing the schema structure.
 * Will be implemented and tested in next steps.
 * 
 * Purpose:
 * - Track when users show interest in properties
 * - Admin manages these leads (middleman concept)
 * - No direct buyer-seller communication
 */

const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema(
  {
    // User Information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },

    // Property Information
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property ID is required']
    },

    // User Details (captured at time of interest)
    name: {
      type: String,
      required: [true, 'Name is required']
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[0-9]{10}$/, 'Phone must be 10 digits']
    },

    whatsappNumber: {
      type: String,
      match: [/^[0-9]{10}$/, 'WhatsApp number must be 10 digits']
    },

    // Interest Details
    message: {
      type: String,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },

    // Lead Status
    status: {
      type: String,
      enum: {
        values: ['new', 'viewed', 'contacted', 'closed', 'rejected'],
        message: 'Status must be new, viewed, contacted, closed, or rejected'
      },
      default: 'new'
    },

    // Admin Assignment
    assignedToAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // Follow-up Information
    notes: {
      type: String,
      maxlength: [2000, 'Notes cannot exceed 2000 characters']
    },

    followUpDate: Date,

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
    collection: 'interests',
    timestamps: true
  }
);

// Prevent duplicate interests from same user for same property
interestSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

// Other indexes for performance
interestSchema.index({ propertyId: 1 }); // Get all interests for a property
interestSchema.index({ status: 1 }); // Filter by status
interestSchema.index({ createdAt: -1 }); // Sort by newest
interestSchema.index({ assignedToAdmin: 1 }); // Find leads for admin

// Export Model
// Usage: const Interest = mongoose.model('Interest', interestSchema);
module.exports = mongoose.model('Interest', interestSchema);
