import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  // References
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true, // One review per booking
    index: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
    index: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Review Content
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },

  // Aspect Ratings (Optional detailed ratings)
  aspects: {
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    quality: {
      type: Number,
      min: 1,
      max: 5
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    value: {
      type: Number,
      min: 1,
      max: 5
    }
  },

  // Provider Response
  response: {
    text: {
      type: String,
      trim: true,
      maxlength: [500, 'Response cannot exceed 500 characters']
    },
    respondedAt: {
      type: Date
    }
  },

  // Moderation
  isFlagged: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true
  },

  // Engagement
  helpfulCount: {
    type: Number,
    default: 0
  },
  markedHelpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
reviewSchema.index({ serviceId: 1, isApproved: 1 });
reviewSchema.index({ providerId: 1, isApproved: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });

// Prevent duplicate reviews for same booking
// Index is already defined in the schema property along with unique: true

// Static method to get service reviews
reviewSchema.statics.getServiceReviews = function (serviceId, limit = 10) {
  return this.find({ serviceId, isApproved: true })
    .populate('reviewerId', 'firstName lastName displayName profileImage')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function (serviceId) {
  const stats = await this.aggregate([
    {
      $match: { serviceId: mongoose.Types.ObjectId(serviceId), isApproved: true }
    },
    {
      $group: {
        _id: '$serviceId',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  return stats[0] || { averageRating: 0, reviewCount: 0 };
};

// Update service and provider ratings after review save
reviewSchema.post('save', async function () {
  try {
    // Update service rating
    const serviceStats = await this.constructor.aggregate([
      {
        $match: { serviceId: this.serviceId, isApproved: true }
      },
      {
        $group: {
          _id: '$serviceId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    if (serviceStats.length > 0) {
      await mongoose.model('Service').findByIdAndUpdate(this.serviceId, {
        rating: Math.round(serviceStats[0].averageRating * 10) / 10,
        reviewCount: serviceStats[0].reviewCount
      });
    }

    // Update provider rating (average across all their services)
    const providerStats = await this.constructor.aggregate([
      {
        $match: { providerId: this.providerId, isApproved: true }
      },
      {
        $group: {
          _id: '$providerId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (providerStats.length > 0) {
      await mongoose.model('User').findByIdAndUpdate(this.providerId, {
        rating: Math.round(providerStats[0].averageRating * 10) / 10,
        totalReviews: providerStats[0].totalReviews
      });
    }

    // Mark booking as reviewed
    await mongoose.model('Booking').findByIdAndUpdate(this.bookingId, {
      isReviewed: true,
      reviewId: this._id
    });

  } catch (error) {
    console.error('Error updating ratings:', error);
  }
});

// Instance method to add provider response
reviewSchema.methods.addResponse = async function (responseText) {
  this.response = {
    text: responseText,
    respondedAt: new Date()
  };
  return await this.save();
};

// Instance method to mark as helpful
reviewSchema.methods.markHelpful = async function (userId) {
  if (!this.markedHelpfulBy.includes(userId)) {
    this.markedHelpfulBy.push(userId);
    this.helpfulCount += 1;
    return await this.save();
  }
  return this;
};

const Review = mongoose.model('Review', reviewSchema);

export default Review;