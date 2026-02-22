import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema({
  // Authentication
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.USER
  },

  // Profile Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  displayName: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  profileImage: {
    type: String,
    default: 'https://res.cloudinary.com/demo/image/upload/avatar-default.png'
  },

  // Location (Critical for hyperlocal matching)
  location: {
    buildingName: {
      type: String,
      required: [true, 'Building name is required'],
      trim: true
    },
    street: {
      type: String,
      required: [true, 'Street name is required'],
      trim: true
    },
    apartmentNumber: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required'],
      trim: true
    },
  },

  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedResident: {
    type: Boolean,
    default: false
  },
  verificationDocument: {
    type: String,
    default: null
  },

  // Skills & Interests
  skills: [{
    type: String,
    trim: true
  }],
  interests: [{
    type: String,
    trim: true
  }],

  // Statistics
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  servicesPosted: {
    type: Number,
    default: 0
  },
  bookingsCompleted: {
    type: Number,
    default: 0
  },
  joinedDate: {
    type: Date,
    default: Date.now
  },

  // Badges
  badges: [{
    name: {
      type: String,
      required: true
    },
    icon: String,
    earnedDate: {
      type: Date,
      default: Date.now
    }
  }],

  // Notification Preferences
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    bookings: {
      type: Boolean,
      default: true
    },
    reviews: {
      type: Boolean,
      default: true
    }
  },

  // Security
  refreshToken: {
    type: String,
    select: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  passwordResetToken: String,
  passwordResetExpires: Date

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
// Note: email index is automatically created by unique: true constraint
userSchema.index({ rating: -1 });
userSchema.index({ 'location.buildingName': 1, 'location.street': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for name (alias for fullName)
userSchema.virtual('name').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Set display name before saving
userSchema.pre('save', function(next) {
  if (!this.displayName) {
    this.displayName = this.fullName;
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate auth token (will be used in controller)
userSchema.methods.toAuthJSON = function() {
  return {
    _id: this._id,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    displayName: this.displayName,
    profileImage: this.profileImage,
    role: this.role,
    location: this.location,
    rating: this.rating,
    badges: this.badges,
    verifiedResident: this.verifiedResident
  };
};

const User = mongoose.model('User', userSchema);

export default User;
