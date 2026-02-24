import express from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServicesByProvider,
  getNearbyServices,
  getPopularServices,
  getCategories,
  incrementViews,
  uploadServiceImages,
  approveService,
  checkIfFavorite,
  toggleFavorite
} from '../controllers/serviceController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { adminOnly } from '../middleware/roleCheck.js';
import { createServiceLimiter } from '../middleware/rateLimiter.js';
import {
  createServiceValidation,
  updateServiceValidation,
  serviceIdValidation,
  serviceSearchValidation
} from '../validators/serviceValidators.js';
import { validate } from '../middleware/validateRequest.js';
import { uploadMultiple } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', serviceSearchValidation, validate, getServices);
router.get('/popular', getPopularServices);
router.get('/nearby', getNearbyServices);
router.get('/categories', getCategories);
router.get('/provider/:userId', getServicesByProvider);
router.get('/:id', optionalAuth, serviceIdValidation, validate, getServiceById);
router.post('/:id/view', serviceIdValidation, validate, incrementViews);
router.get('/:id/is-favorite', protect, serviceIdValidation, validate, checkIfFavorite);

// Protected routes
router.use(protect);

router.post('/:id/favorite', serviceIdValidation, validate, toggleFavorite);

router.post('/', createService);
router.post('/', createServiceLimiter, createServiceValidation, validate, createService);
router.patch('/:id', updateServiceValidation, validate, updateService);
router.delete('/:id', serviceIdValidation, validate, deleteService);
router.post('/:id/images', uploadMultiple('images', 5), serviceIdValidation, validate, uploadServiceImages);

// Admin only routes
router.patch('/:id/approve', adminOnly, serviceIdValidation, validate, approveService);

export default router;
