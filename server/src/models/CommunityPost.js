import mongoose from 'mongoose';
import { COMMUNITY_POST_TYPES } from '../config/constants.js';

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const communityPostSchema = new mongoose.Schema({
  // Author
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Post Type
  type: {
    type: String,
    enum: Object.values(COMMUNITY_POST_TYPES),
    required: true,
    default: COMMUNITY_POST_TYPES.GENERAL
  },

  // Content
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    maxlength: [3000, 'Content cannot exceed 3000 characters']
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return v.startsWith('http://') || v.startsWith('https://');
      },
      message: 'Image must be a valid URL'
    }
  }],

  // Location Specific (for hyperlocal filtering)
  buildingName: {
    type: String,
    trim: true,
    index: true
  },
  street: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  city: {
    type: String,
    trim: true
  },

  // Engagement
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  comments: [commentSchema],
  commentCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },

  // Moderation
  isPinned: {
    type: Boolean,
    default: false,
    index: true
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  },
  isFlagged: {
    type: Boolean,
    default: false
  },

  // Event-specific fields (optional)
  eventDate: {
    type: Date
  },
  eventTime: {
    type: String
  },
  eventLocation: {
    type: String,
    trim: true
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
communityPostSchema.index({ buildingName: 1, street: 1, isArchived: 1 });
communityPostSchema.index({ street: 1, type: 1, isArchived: 1 });
communityPostSchema.index({ isPinned: -1, createdAt: -1 });
communityPostSchema.index({ type: 1, createdAt: -1 });

// Virtual for like status check (will be populated in controller)
communityPostSchema.virtual('isLikedByUser').get(function() {
  return this._isLikedByUser || false;
});

// Static method to get community posts for location
communityPostSchema.statics.getLocationPosts = function(street, buildingName = null, limit = 20) {
  const filter = {
    street,
    isArchived: false
  };
  
  if (buildingName) {
    filter.$or = [
      { buildingName },
      { buildingName: null } // Include street-wide posts
    ];
  }
  
  return this.find(filter)
    .populate('authorId', 'firstName lastName displayName profileImage verifiedResident')
    .populate('comments.userId', 'firstName lastName displayName profileImage')
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(limit);
};

// Static method to get posts by type
communityPostSchema.statics.getPostsByType = function(type, street, limit = 20) {
  return this.find({
    type,
    street,
    isArchived: false
  })
  .populate('authorId', 'firstName lastName displayName profileImage')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Instance method to add like
communityPostSchema.methods.addLike = async function(userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    this.likeCount = this.likes.length;
    return await this.save();
  }
  return this;
};

// Instance method to remove like
communityPostSchema.methods.removeLike = async function(userId) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
    this.likeCount = this.likes.length;
    return await this.save();
  }
  return this;
};

// Instance method to add comment
communityPostSchema.methods.addComment = async function(userId, text) {
  this.comments.push({
    userId,
    text,
    createdAt: new Date()
  });
  this.commentCount = this.comments.length;
  return await this.save();
};

// Instance method to delete comment
communityPostSchema.methods.deleteComment = async function(commentId) {
  this.comments = this.comments.filter(
    comment => comment._id.toString() !== commentId.toString()
  );
  this.commentCount = this.comments.length;
  return await this.save();
};

// Instance method to increment views
communityPostSchema.methods.incrementViews = async function() {
  this.views += 1;
  return await this.save();
};

// Pre-save hook to update counts
communityPostSchema.pre('save', function(next) {
  if (this.isModified('likes')) {
    this.likeCount = this.likes.length;
  }
  if (this.isModified('comments')) {
    this.commentCount = this.comments.length;
  }
  next();
});

const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);

export default CommunityPost;
