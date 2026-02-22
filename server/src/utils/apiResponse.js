/**
 * Standard API Response Format
 * Ensures all API responses follow the same structure
 */

class ApiResponse {
  constructor(success, message, data = null, statusCode = 200) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }

  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static created(res, data = null, message = 'Resource created successfully') {
    return res.status(201).json({
      success: true,
      message,
      data
    });
  }

  static error(res, message = 'An error occurred', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors
    });
  }

  static badRequest(res, message = 'Bad request', errors = null) {
    return res.status(400).json({
      success: false,
      message,
      errors
    });
  }

  static unauthorized(res, message = 'Unauthorized access') {
    return res.status(401).json({
      success: false,
      message
    });
  }

  static forbidden(res, message = 'Access forbidden') {
    return res.status(403).json({
      success: false,
      message
    });
  }

  static notFound(res, message = 'Resource not found') {
    return res.status(404).json({
      success: false,
      message
    });
  }

  static paginated(res, data, page, limit, total, message = 'Success') {
    const totalPages = Math.ceil(total / limit);
    
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  }
}

export default ApiResponse;
