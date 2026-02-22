import express from 'express';
import {
  getUserById,
  updateProfile,
  updateAvatar,
  getUserServices,
  getUserReviews,
  deleteAccount,
  updatePreferences,
  getUserStats,
  searchUsers
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { updateProfileValidation } from '../validators/authValidators.js';
import { validate } from '../middleware/validateRequest.js';

const router = express.Router();

// Public routes
router.get('/search', searchUsers);
router.get('/:id', getUserById);
router.get('/:id/services', getUserServices);
router.get('/:id/reviews', getUserReviews);
router.get('/:id/stats', getUserStats);

// Protected routes
router.use(protect);

router.put('/me', updateProfileValidation, validate, updateProfile);
router.post('/me/avatar', updateAvatar);
router.delete('/me', deleteAccount);
router.patch('/me/preferences', updatePreferences);

export default router;