import { validationResult } from 'express-validator';
import ApiResponse from '../utils/apiResponse.js';

/**
 * Validate request and return errors if any
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return ApiResponse.badRequest(
      res,
      'Validation failed',
      extractedErrors
    );
  }
  
  next();
};

export default validate;
