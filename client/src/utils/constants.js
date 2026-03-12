import { SERVICE_CATEGORIES_MAP } from './categories';

export const SERVICE_CATEGORIES = Object.keys(SERVICE_CATEGORIES_MAP);
  
  export const BOOKING_STATUS = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  };