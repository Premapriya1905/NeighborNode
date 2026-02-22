import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Protect routes - Verify JWT token
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return ApiResponse.unauthorized(res, 'Not authorized to access this route');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!req.user) {
      return ApiResponse.unauthorized(res, 'User not found');
    }

    next();
  } catch (error) {
    return ApiResponse.unauthorized(res, 'Not authorized to access this route');
  }
});

/**
 * Optional auth - Attach user if token is valid, but don't require it
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password -refreshToken');
    } catch (error) {
      // Token invalid but continue anyway
      req.user = null;
    }
  }

  next();
});

/**
 * Check if user owns the resource
 */
export const checkOwnership = (Model, paramName = 'id', userField = 'userId') => {
  return asyncHandler(async (req, res, next) => {
    const resource = await Model.findById(req.params[paramName]);

    if (!resource) {
      return ApiResponse.notFound(res, 'Resource not found');
    }

    // Check ownership
    const resourceUserId = resource[userField]?.toString() || resource._id.toString();
    const currentUserId = req.user._id.toString();

    if (resourceUserId !== currentUserId && req.user.role !== 'admin') {
      return ApiResponse.forbidden(res, 'Not authorized to access this resource');
    }

    // Attach resource to request for use in controller
    req.resource = resource;
    next();
  });
};

export default protect;
