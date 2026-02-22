import express from 'express';
import {
  createReview,
  getServiceReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  addProviderResponse,
  markHelpful,
  getReviewStats,
  flagReview
} from '../controllers/reviewController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { reviewLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.get('/service/:serviceId', getServiceReviews);
router.get('/user/:userId', getUserReviews);
router.get('/service/:serviceId/stats', getReviewStats);

// Protected routes
router.use(protect);

router.post('/', reviewLimiter, createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.post('/:id/response', addProviderResponse);
router.post('/:id/helpful', markHelpful);
router.post('/:id/flag', flagReview);

export default router;