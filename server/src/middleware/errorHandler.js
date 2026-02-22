import ApiResponse from '../utils/apiResponse.js';

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error.statusCode = 404;
    error.message = message;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error.statusCode = 400;
    error.message = message;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error.statusCode = 400;
    error.message = message.join(', ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error.statusCode = 401;
    error.message = message;
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error.statusCode = 401;
    error.message = message;
  }

  // Send error response
  return res.status(error.statusCode).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Handle 404 - Route Not Found
 */
export const notFound = (req, res, next) => {
  return ApiResponse.notFound(
    res,
    `Route ${req.originalUrl} not found`
  );
};

export default errorHandler;
