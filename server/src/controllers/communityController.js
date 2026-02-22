import CommunityPost from '../models/CommunityPost.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination } from '../utils/helpers.js';

/**
 * @desc    Get community posts for location
 * @route   GET /api/v1/community/posts
 * @access  Public
 */
export const getPosts = asyncHandler(async (req, res) => {
  const { street, buildingName, type, page = 1, limit = 20 } = req.query;
  const { skip, limit: parsedLimit } = getPagination(page, limit);

  if (!street) {
    throw ApiError.badRequest('Street parameter is required');
  }

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

  if (type) {
    filter.type = type;
  }

  const [posts, total] = await Promise.all([
    CommunityPost.find(filter)
      .populate('authorId', 'firstName lastName displayName profileImage verifiedResident')
      .populate('comments.userId', 'firstName lastName displayName profileImage')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    CommunityPost.countDocuments(filter)
  ]);

  // Add isLikedByUser flag if user is authenticated
  if (req.user) {
    posts.forEach(post => {
      post.isLikedByUser = post.likes.some(
        like => like.toString() === req.user._id.toString()
      );
    });
  }

  ApiResponse.paginated(
    res,
    posts,
    page,
    parsedLimit,
    total,
    'Community posts retrieved successfully'
  );
});

/**
 * @desc    Get single post
 * @route   GET /api/v1/community/posts/:id
 * @access  Public
 */
export const getPostById = asyncHandler(async (req, res) => {
  const post = await CommunityPost.findById(req.params.id)
    .populate('authorId', 'firstName lastName displayName profileImage verifiedResident')
    .populate('comments.userId', 'firstName lastName displayName profileImage');

  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  // Increment views
  post.incrementViews().catch(err => console.error('View increment error:', err));

  // Check if user liked the post
  if (req.user) {
    post._isLikedByUser = post.likes.some(
      like => like.toString() === req.user._id.toString()
    );
  }

  ApiResponse.success(res, post, 'Post retrieved successfully');
});

/**
 * @desc    Create community post
 * @route   POST /api/v1/community/posts
 * @access  Private
 */
export const createPost = asyncHandler(async (req, res) => {
  const { type, title, content, images, eventDate, eventTime, eventLocation } = req.body;

  // Use user's location by default
  const postData = {
    authorId: req.user._id,
    type,
    title,
    content,
    images: images || [],
    buildingName: req.user.location.buildingName,
    street: req.user.location.street,
    city: req.user.location.city
  };

  // Add event-specific fields if type is 'event'
  if (type === 'event') {
    postData.eventDate = eventDate;
    postData.eventTime = eventTime;
    postData.eventLocation = eventLocation;
  }

  const post = await CommunityPost.create(postData);

  await post.populate('authorId', 'firstName lastName displayName profileImage verifiedResident');

  ApiResponse.created(res, post, 'Post created successfully');
});

/**
 * @desc    Update post
 * @route   PUT /api/v1/community/posts/:id
 * @access  Private
 */
export const updatePost = asyncHandler(async (req, res) => {
  let post = await CommunityPost.findById(req.params.id);

  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  // Verify ownership
  if (post.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized to update this post');
  }

  const { title, content, images, eventDate, eventTime, eventLocation } = req.body;

  if (title) post.title = title;
  if (content) post.content = content;
  if (images) post.images = images;
  if (eventDate) post.eventDate = eventDate;
  if (eventTime) post.eventTime = eventTime;
  if (eventLocation) post.eventLocation = eventLocation;

  await post.save();

  await post.populate('authorId', 'firstName lastName displayName profileImage verifiedResident');

  ApiResponse.success(res, post, 'Post updated successfully');
});

/**
 * @desc    Delete post
 * @route   DELETE /api/v1/community/posts/:id
 * @access  Private
 */
export const deletePost = asyncHandler(async (req, res) => {
  const post = await CommunityPost.findById(req.params.id);

  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  // Verify ownership or admin
  if (post.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized to delete this post');
  }

  await post.deleteOne();

  ApiResponse.success(res, null, 'Post deleted successfully');
});

/**
 * @desc    Like/Unlike post
 * @route   POST /api/v1/community/posts/:id/like
 * @access  Private
 */
export const toggleLike = asyncHandler(async (req, res) => {
  const post = await CommunityPost.findById(req.params.id);

  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  const userId = req.user._id;
  const isLiked = post.likes.includes(userId);

  if (isLiked) {
    await post.removeLike(userId);
  } else {
    await post.addLike(userId);
  }

  ApiResponse.success(
    res,
    { 
      liked: !isLiked,
      likeCount: post.likeCount 
    },
    isLiked ? 'Post unliked' : 'Post liked'
  );
});

/**
 * @desc    Add comment to post
 * @route   POST /api/v1/community/posts/:id/comment
 * @access  Private
 */
export const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    throw ApiError.badRequest('Comment text is required');
  }

  const post = await CommunityPost.findById(req.params.id);

  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  await post.addComment(req.user._id, text);

  await post.populate('comments.userId', 'firstName lastName displayName profileImage');

  ApiResponse.success(
    res,
    { 
      comments: post.comments,
      commentCount: post.commentCount 
    },
    'Comment added successfully'
  );
});

/**
 * @desc    Delete comment
 * @route   DELETE /api/v1/community/posts/:id/comment/:commentId
 * @access  Private
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;

  const post = await CommunityPost.findById(id);

  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  const comment = post.comments.id(commentId);

  if (!comment) {
    throw ApiError.notFound('Comment not found');
  }

  // Verify ownership or admin
  if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized to delete this comment');
  }

  await post.deleteComment(commentId);

  ApiResponse.success(res, null, 'Comment deleted successfully');
});

/**
 * @desc    Pin/Unpin post (Admin only)
 * @route   PATCH /api/v1/community/posts/:id/pin
 * @access  Private/Admin
 */
export const togglePin = asyncHandler(async (req, res) => {
  const post = await CommunityPost.findByIdAndUpdate(
    req.params.id,
    [{ $set: { isPinned: { $not: '$isPinned' } } }],
    { new: true }
  );

  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  ApiResponse.success(
    res,
    { isPinned: post.isPinned },
    post.isPinned ? 'Post pinned' : 'Post unpinned'
  );
});

/**
 * @desc    Archive post (Admin only)
 * @route   PATCH /api/v1/community/posts/:id/archive
 * @access  Private/Admin
 */
export const archivePost = asyncHandler(async (req, res) => {
  const post = await CommunityPost.findByIdAndUpdate(
    req.params.id,
    { isArchived: true },
    { new: true }
  );

  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  ApiResponse.success(res, null, 'Post archived successfully');
});

/**
 * @desc    Get posts by type
 * @route   GET /api/v1/community/posts/type/:type
 * @access  Public
 */
export const getPostsByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { street, limit = 20 } = req.query;

  if (!street) {
    throw ApiError.badRequest('Street parameter is required');
  }

  const posts = await CommunityPost.getPostsByType(type, street, parseInt(limit));

  ApiResponse.success(res, posts, 'Posts retrieved successfully');
});