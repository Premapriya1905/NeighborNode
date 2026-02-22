import { body, param, query } from 'express-validator';
import { SERVICE_CATEGORIES, PRICING_TYPES, SERVICE_AREAS, DAYS_OF_WEEK } from '../config/constants.js';

export const createServiceValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Service title is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Service description is required')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(SERVICE_CATEGORIES)
    .withMessage('Invalid category'),
  
  body('pricing.type')
    .notEmpty()
    .withMessage('Pricing type is required')
    .isIn(Object.values(PRICING_TYPES))
    .withMessage('Invalid pricing type'),
  
  body('pricing.amount')
    .if(body('pricing.type').not().equals(PRICING_TYPES.FREE))
    .notEmpty()
    .withMessage('Price amount is required for non-free services')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('location.buildingName')
    .trim()
    .notEmpty()
    .withMessage('Building name is required'),
  
  body('location.street')
    .trim()
    .notEmpty()
    .withMessage('Street name is required'),
  
  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('location.serviceArea')
    .optional()
    .isIn(SERVICE_AREAS)
    .withMessage('Invalid service area'),
  
  body('availability.days')
    .optional()
    .isArray()
    .withMessage('Availability days must be an array')
    .custom((days) => {
      return days.every(day => DAYS_OF_WEEK.includes(day));
    })
    .withMessage('Invalid day in availability'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array')
];

export const updateServiceValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid service ID'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  
  body('category')
    .optional()
    .isIn(SERVICE_CATEGORIES)
    .withMessage('Invalid category'),
  
  body('pricing.type')
    .optional()
    .isIn(Object.values(PRICING_TYPES))
    .withMessage('Invalid pricing type'),
  
  body('pricing.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
];

export const serviceIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid service ID')
];

export const serviceSearchValidation = [
  query('category')
    .optional()
    .isIn(SERVICE_CATEGORIES)
    .withMessage('Invalid category'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  
  query('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];
