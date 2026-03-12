import mongoose from 'mongoose';
import slugify from 'slugify';
import { SERVICE_CATEGORIES, PRICING_TYPES, SERVICE_AREAS, DAYS_OF_WEEK } from '../config/constants.js';

const serviceSchema = new mongoose.Schema({
  // Provider Reference
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Service Details
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: SERVICE_CATEGORIES
  },
  subcategory: {
    type: String,
    trim: true
  },

  // Pricing
  pricing: {
    type: {
      type: String,
      enum: Object.values(PRICING_TYPES),
      required: true,
      default: PRICING_TYPES.FIXED
    },
    amount: {
      type: Number,
      required: function () {
        return this.pricing.type !== PRICING_TYPES.FREE;
      },
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },

  // Media
  images: [{
    type: String,
    validate: {
      validator: function (v) {
        return v.startsWith('http://') || v.startsWith('https://');
      },
      message: 'Image must be a valid URL'
    }
  }],

  // Availability
  availability: {
    days: [{
      type: String,
      enum: DAYS_OF_WEEK
    }],
    timeSlots: [{
      start: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM']
      },
      end: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM']
      }
    }],
    flexible: {
      type: Boolean,
      default: false
    }
  },

  // Location
  location: {
    buildingName: {
      type: String,
      required: true,
      trim: true
    },
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    serviceArea: {
      type: String,
      enum: SERVICE_AREAS,
      default: 'Same building'
    }
  },

  // Tags & Features
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  features: [{
    type: String,
    trim: true
  }],

  // Status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isApproved: {
    type: Boolean,
    default: true,
    index: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },

  // Statistics
  views: {
    type: Number,
    default: 0
  },
  bookings: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },

  // SEO
  slug: {
    type: String,
    unique: true,
    index: true
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
serviceSchema.index({ category: 1, isActive: 1, isApproved: 1 });
serviceSchema.index({ rating: -1, reviewCount: -1 });
serviceSchema.index({ 'location.buildingName': 1, 'location.street': 1 });
serviceSchema.index({ category: 'text', description: 'text', subcategory: 'text' }); // Full-text search

// Virtual for reviews
serviceSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'serviceId'
});

// Generate slug before saving
serviceSchema.pre('save', function (next) {
  if (this.isModified('category') || this.isModified('subcategory')) {
    const slugBase = this.subcategory ? `${this.category}-${this.subcategory}` : this.category;
    this.slug = slugify(slugBase, {
      lower: true,
      strict: true,
      trim: true
    }) + '-' + this._id.toString().slice(-6);
  }
  next();
});

// Update provider's service count
serviceSchema.post('save', async function () {
  if (this.isNew) {
    await mongoose.model('User').findByIdAndUpdate(
      this.providerId,
      { $inc: { servicesPosted: 1 } }
    );
  }
});

// Static method to get popular services
serviceSchema.statics.getPopularServices = function (limit = 10) {
  return this.find({ isActive: true, isApproved: true })
    .sort({ rating: -1, reviewCount: -1, views: -1 })
    .limit(limit)
    .populate('providerId', 'firstName lastName displayName profileImage rating verifiedResident');
};

// Static method to get nearby services
serviceSchema.statics.getNearbyServices = function (buildingName, street, limit = 20) {
  return this.find({
    isActive: true,
    isApproved: true,
    $or: [
      { 'location.buildingName': buildingName },
      { 'location.street': street }
    ]
  })
    .limit(limit)
    .populate('providerId', 'firstName lastName displayName profileImage rating verifiedResident');
};

// Method to increment views
serviceSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

const Service = mongoose.model('Service', serviceSchema);

export default Service;
