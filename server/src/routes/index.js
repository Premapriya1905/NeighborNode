import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import communityRoutes from './communityRoutes.js';

const router = express.Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/services', serviceRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/community', communityRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'NeighborNode API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;