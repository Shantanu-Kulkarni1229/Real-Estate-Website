const mongoose = require('mongoose');

const residentialSpecSchema = new mongoose.Schema(
  {
    bhk: { type: Number, min: 0 },
    bathrooms: { type: Number, min: 0 },
    balconies: { type: Number, min: 0 },
    superBuiltUpArea: { type: Number, min: 0 },
    carpetArea: { type: Number, min: 0 },
    furnishing: {
      type: String,
      enum: ['furnished', 'semi-furnished', 'unfurnished']
    },
    floorNumber: { type: Number, min: 0 },
    totalFloors: { type: Number, min: 0 },
    propertyAge: { type: Number, min: 0 },
    facing: {
      type: String,
      enum: ['north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west']
    },
    parking: {
      available: { type: Boolean, default: false },
      type: {
        type: String,
        enum: ['open', 'covered', 'basement', 'stilt']
      }
    }
  },
  { _id: false }
);

const plotSpecSchema = new mongoose.Schema(
  {
    plotArea: { type: Number, min: 0 },
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    boundaryWall: { type: Boolean, default: false },
    cornerPlot: { type: Boolean, default: false }
  },
  { _id: false }
);

const commercialSpecSchema = new mongoose.Schema(
  {
    propertyUse: {
      type: String,
      enum: ['office', 'shop', 'warehouse', 'other']
    },
    floor: { type: Number, min: 0 },
    washrooms: { type: Number, min: 0 },
    pantry: { type: Boolean, default: false },
    furnishedStatus: {
      type: String,
      enum: ['furnished', 'semi-furnished', 'unfurnished']
    }
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller ID is required'],
      index: true
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller ID is required'],
      index: true
    },

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
    propertyType: {
      type: String,
      enum: ['apartment', 'villa', 'plot', 'commercial'],
      required: [true, 'Property type is required']
    },
    listingType: {
      type: String,
      enum: ['sell', 'rent'],
      required: [true, 'Listing type is required']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    negotiable: {
      type: Boolean,
      default: false
    },

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
    locality: {
      type: String
    },
    landmark: {
      type: String
    },
    latitude: { type: Number },
    longitude: { type: Number },

    specifications: {
      residential: residentialSpecSchema,
      plot: plotSpecSchema,
      commercial: commercialSpecSchema
    },

    amenities: {
      type: [String],
      default: []
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 10;
        },
        message: 'Maximum 10 images allowed'
      }
    },
    videos: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 5;
        },
        message: 'Maximum 5 videos allowed'
      }
    },
    virtualTourUrl: {
      type: String
    },

    ownerName: {
      type: String,
      required: [true, 'Owner name is required']
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required']
    },
    ownershipType: {
      type: String,
      enum: ['freehold', 'leasehold'],
      default: 'freehold'
    },
    availableFrom: {
      type: Date
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    viewsCount: {
      type: Number,
      default: 0
    }
  },
  {
    collection: 'properties',
    timestamps: true
  }
);

propertySchema.index({ city: 1, propertyType: 1, listingType: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ 'specifications.residential.bhk': 1 });
propertySchema.index({ createdAt: -1 });

propertySchema.pre('validate', function preValidate(next) {
  if (!this.createdBy && this.sellerId) {
    this.createdBy = this.sellerId;
  }

  if (!this.sellerId && this.createdBy) {
    this.sellerId = this.createdBy;
  }

  next();
});

module.exports = mongoose.model('Property', propertySchema);
