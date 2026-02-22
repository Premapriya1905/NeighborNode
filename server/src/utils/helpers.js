import jwt from 'jsonwebtoken';

/**
 * Generate JWT Access Token
 */
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Generate JWT Refresh Token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );
};

/**
 * Generate both tokens
 */
export const generateTokens = (userId) => {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId)
  };
};

/**
 * Verify JWT Token
 */
export const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

/**
 * Pagination Helper
 */
export const getPagination = (page = 1, limit = 10) => {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 10;
  const skip = (parsedPage - 1) * parsedLimit;
  
  return {
    page: parsedPage,
    limit: parsedLimit,
    skip
  };
};

/**
 * Filter object by allowed fields
 */
export const filterObject = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

/**
 * Calculate distance between two coordinates (in km)
 * Using Haversine formula
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Generate random code
 */
export const generateCode = (length = 6) => {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
};

/**
 * Sanitize user data (remove sensitive fields)
 */
export const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  delete userObj.refreshToken;
  delete userObj.passwordResetToken;
  delete userObj.passwordResetExpires;
  
  // Ensure name is included for frontend compatibility
  if (!userObj.name && userObj.firstName && userObj.lastName) {
    userObj.name = `${userObj.firstName} ${userObj.lastName}`;
  }
  
  return userObj;
};

/**
 * Build query filter for search
 */
export const buildSearchQuery = (searchTerm, fields = []) => {
  if (!searchTerm) return {};
  
  return {
    $or: fields.map(field => ({
      [field]: { $regex: searchTerm, $options: 'i' }
    }))
  };
};

/**
 * Get time difference in human-readable format
 */
export const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  
  return 'Just now';
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate slug from string
 */
export const generateSlug = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
