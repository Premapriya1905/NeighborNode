import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, User, DollarSign, ChevronDown } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { BOOKING_STATUS } from "../../utils/constants";
import BookingModal from "./BookingModal";

const BookingCard = ({ booking, onStatusChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case BOOKING_STATUS.PENDING:
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700";
      case BOOKING_STATUS.ACCEPTED:
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700";
      case BOOKING_STATUS.COMPLETED:
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700";
      case BOOKING_STATUS.CANCELLED:
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700";
      case BOOKING_STATUS.REJECTED:
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-700";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const isUpcoming = new Date(booking.scheduledDate) > new Date();
  const isPast = new Date(booking.scheduledDate) < new Date();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        onClick={() => setIsModalOpen(true)}
        className="cursor-pointer"
      >
        <div className="glass-strong rounded-2xl p-6 hover:shadow-soft-lg transition-shadow">
          {/* Header with Status */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">
                {booking.serviceName || "Service"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Booking ID: {booking._id?.slice(-6) || "N/A"}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}
            >
              {getStatusLabel(booking.status)}
            </span>
          </div>

          {/* Date and Time */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {formatDate(booking.scheduledDate)} at {booking.scheduledTime}
              </span>
              {isUpcoming && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                  Upcoming
                </span>
              )}
              {isPast && booking.status === BOOKING_STATUS.PENDING && (
                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full">
                  Overdue
                </span>
              )}
            </div>
          </div>

          {/* Provider/Customer Info */}
          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4" />
              <span className="text-sm">
                {booking.providerName || booking.customerName || "User"}
              </span>
            </div>
            {booking.location && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">
                  {typeof booking.location === "string"
                    ? booking.location
                    : booking.location?.street ||
                      booking.location?.city ||
                      "Location not specified"}
                </span>
              </div>
            )}
          </div>

          {/* Price and Duration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="font-semibold text-lg">
                {formatCurrency(booking.agreedPrice)}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({booking.duration || 60} min)
              </span>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>

          {/* Quick Actions Preview */}
          {booking.status === BOOKING_STATUS.PENDING && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 flex gap-2">
              <button className="flex-1 btn btn-sm btn-primary">Accept</button>
              <button className="flex-1 btn btn-sm btn-secondary">
                Reject
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        booking={booking}
        onStatusChange={onStatusChange}
      />
    </>
  );
};

export default BookingCard;
