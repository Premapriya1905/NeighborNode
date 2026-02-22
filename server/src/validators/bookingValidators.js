import { body, param } from 'express-validator';

export const createBookingValidation = [
  body('serviceId')
    .notEmpty()
    .withMessage('Service ID is required')
    .isMongoId()
    .withMessage('Invalid service ID'),

  body('scheduledDate')
    .notEmpty()
    .withMessage('Scheduled date is required')
    .isISO8601()
    .withMessage('Invalid date format'),

  body('scheduledTime')
    .notEmpty()
    .withMessage('Scheduled time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format'),

  body('customerNote')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note cannot exceed 500 characters'),

  body('duration')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes')
];

export const bookingIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid booking ID')
];

export const rejectBookingValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid booking ID'),

  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
];

