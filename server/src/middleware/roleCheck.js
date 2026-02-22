import ApiResponse from '../utils/apiResponse.js';
import { USER_ROLES } from '../config/constants.js';

/**
 * Grant access to specific roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Please login to access this route');
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(
        res,
        `User role '${req.user.role}' is not authorized to access this route`
      );
    }

    next();
  };
};

/**
 * Admin only access
 */
export const adminOnly = authorize(USER_ROLES.ADMIN);

/**
 * Check if user is the owner or admin
 */
export const ownerOrAdmin = (getUserId) => {
  return (req, res, next) => {
    const userId = typeof getUserId === 'function' ? getUserId(req) : req.params[getUserId];
    
    if (req.user._id.toString() === userId || req.user.role === USER_ROLES.ADMIN) {
      return next();
    }

    return ApiResponse.forbidden(res, 'Not authorized to perform this action');
  };
};

export default authorize;
