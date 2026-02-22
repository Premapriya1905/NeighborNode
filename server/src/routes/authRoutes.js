import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  updatePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { registerValidation, loginValidation } from '../validators/authValidators.js';
import { validate } from '../middleware/validateRequest.js';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.use(protect); // All routes after this require authentication

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/update-password', updatePassword);

export default router;
