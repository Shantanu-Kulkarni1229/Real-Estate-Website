const mongoose = require('mongoose');

const searchActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    searchType: {
      type: String,
      enum: ['buy', 'rent'],
      required: [true, 'Search type is required'],
      index: true
    },
    queryText: {
      type: String,
      maxlength: [300, 'Search query cannot exceed 300 characters']
    },
    city: {
      type: String,
      maxlength: [120, 'City cannot exceed 120 characters']
    },
    propertyType: {
      type: String,
      maxlength: [120, 'Property type cannot exceed 120 characters']
    },
    budgetMin: {
      type: String,
      maxlength: [50, 'Budget minimum cannot exceed 50 characters']
    },
    budgetMax: {
      type: String,
      maxlength: [50, 'Budget maximum cannot exceed 50 characters']
    },
    sourcePage: {
      type: String,
      maxlength: [120, 'Source page cannot exceed 120 characters']
    }
  },
  {
    collection: 'search_activities',
    timestamps: true
  }
);

searchActivitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('SearchActivity', searchActivitySchema);
