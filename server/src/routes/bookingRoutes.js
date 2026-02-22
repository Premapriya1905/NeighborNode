import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
  completeBooking,
  cancelBooking,
  getUpcomingBookings
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', createBooking);
router.get('/', getMyBookings);
router.get('/upcoming', getUpcomingBookings);
router.get('/:id', getBookingById);
router.patch('/:id/accept', acceptBooking);
router.patch('/:id/reject', rejectBooking);
router.patch('/:id/complete', completeBooking);
router.patch('/:id/cancel', cancelBooking);

export default router;
