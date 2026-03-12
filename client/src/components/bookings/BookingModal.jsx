import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  MapPin,
  User,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";
import { Modal } from "../common/Modal";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { BOOKING_STATUS } from "../../utils/constants";
import BookingTimeline from "./BookingTimeline";
import bookingService from "../../services/bookingService";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

const BookingModal = ({ isOpen, onClose, booking, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const { user } = useAuth();

  if (!booking) return null;

  const isProvider = user?._id === booking.providerId?._id || user?._id === booking.providerId;
  const isCustomer = user?._id === booking.customerId?._id || user?._id === booking.customerId;

  const handleAccept = async () => {
    setLoading(true);
    try {
      const response = await bookingService.acceptBooking(booking._id);
      if (response.success) {
        toast.success("Booking accepted successfully!");
        onStatusChange();
        onClose();
      }
    } catch (error) {
      toast.error(error.message || "Failed to accept booking");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setLoading(true);
    try {
      const response = await bookingService.rejectBooking(
        booking._id,
        rejectReason,
      );
      if (response.success) {
        toast.success("Booking rejected");
        onStatusChange();
        onClose();
      }
    } catch (error) {
      toast.error(error.message || "Failed to reject booking");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }
    setLoading(true);
    try {
      const response = await bookingService.cancelBooking(
        booking._id,
        cancelReason,
      );
      if (response.success) {
        toast.success("Booking cancelled");
        onStatusChange();
        onClose();
      }
    } catch (error) {
      toast.error(error.message || "Failed to cancel booking");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await bookingService.completeBooking(booking._id);
      if (response.success) {
        toast.success("Booking marked as completed!");
        onStatusChange();
        onClose();
      }
    } catch (error) {
      toast.error(error.message || "Failed to complete booking");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case BOOKING_STATUS.PENDING:
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      case BOOKING_STATUS.ACCEPTED:
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case BOOKING_STATUS.COMPLETED:
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case BOOKING_STATUS.CANCELLED:
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      case BOOKING_STATUS.REJECTED:
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="glass-strong rounded-2xl max-w-lg w-full p-6 my-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold">
                    {booking.serviceId?.category || "Category"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {booking.serviceId?.title || "Service Title"}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="mb-6">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}
                >
                  {booking.status.charAt(0).toUpperCase() +
                    booking.status.slice(1)}
                </span>
              </div>

              {/* Timeline */}
              <div className="mb-6">
                <BookingTimeline booking={booking} />
              </div>

              {/* Booking Details */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Date & Time
                    </p>
                    <p className="font-semibold">
                      {formatDate(booking.scheduledDate)} at{" "}
                      {booking.scheduledTime}
                    </p>
                  </div>
                </div>

                {booking.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Location
                      </p>
                      <p className="font-semibold">
                        {typeof booking.location === "string"
                          ? booking.location
                          : booking.location?.street ||
                          booking.location?.city ||
                          "Location not specified"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Duration
                    </p>
                    <p className="font-semibold">
                      {booking.duration || 60} minutes
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Price
                    </p>
                    <p className="font-semibold">
                      {formatCurrency(booking.agreedPrice)}
                      {booking.serviceId?.pricing?.type === 'hourly' && '/hour'}
                      {booking.serviceId?.pricing?.type === 'monthly' && '/month'}
                      {booking.serviceId?.pricing?.type === 'yearly' && '/year'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
                <h4 className="font-semibold text-sm">Contact Information</h4>
                {booking.providerEmail && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <a
                      href={`mailto:${booking.providerEmail}`}
                      className="text-primary-600 hover:underline"
                    >
                      {booking.providerEmail}
                    </a>
                  </div>
                )}
                {booking.providerPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a
                      href={`tel:${booking.providerPhone}`}
                      className="text-primary-600 hover:underline"
                    >
                      {booking.providerPhone}
                    </a>
                  </div>
                )}
              </div>

              {/* Notes */}
              {(booking.customerNote || booking.providerNote) && (
                <div className="mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
                  <h4 className="font-semibold text-sm mb-3">Notes</h4>
                  {booking.customerNote && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Customer Note
                      </p>
                      <p className="text-sm bg-gray-50 dark:bg-slate-800 p-2 rounded">
                        {booking.customerNote}
                      </p>
                    </div>
                  )}
                  {booking.providerNote && (
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Provider Note
                      </p>
                      <p className="text-sm bg-gray-50 dark:bg-slate-800 p-2 rounded">
                        {booking.providerNote}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {booking.status === BOOKING_STATUS.PENDING && isProvider && (
                  <>
                    <button
                      onClick={handleAccept}
                      disabled={loading}
                      className="w-full btn btn-primary py-2"
                    >
                      {loading ? "Accepting..." : "Accept Booking"}
                    </button>
                    {!showRejectReason ? (
                      <button
                        onClick={() => setShowRejectReason(true)}
                        className="w-full btn btn-secondary py-2"
                      >
                        Reject Booking
                      </button>
                    ) : (
                      <>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Please provide a reason for rejection..."
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm"
                          rows="3"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleReject}
                            disabled={loading}
                            className="flex-1 btn btn-danger py-2 text-sm"
                          >
                            {loading ? "Rejecting..." : "Confirm Rejection"}
                          </button>
                          <button
                            onClick={() => setShowRejectReason(false)}
                            className="flex-1 btn btn-secondary py-2 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}

                {booking.status === BOOKING_STATUS.PENDING && isCustomer && (
                  <>
                    {!showCancelReason ? (
                      <button
                        onClick={() => setShowCancelReason(true)}
                        className="w-full btn btn-secondary py-2"
                      >
                        Cancel Booking
                      </button>
                    ) : (
                      <>
                        <textarea
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="Please provide a reason for cancellation..."
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm"
                          rows="3"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleCancel}
                            disabled={loading}
                            className="flex-1 btn btn-danger py-2 text-sm"
                          >
                            {loading ? "Cancelling..." : "Confirm Cancellation"}
                          </button>
                          <button
                            onClick={() => setShowCancelReason(false)}
                            className="flex-1 btn btn-secondary py-2 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}

                {booking.status === BOOKING_STATUS.ACCEPTED && isProvider && (
                  <>
                    <button
                      onClick={handleComplete}
                      disabled={loading}
                      className="w-full btn btn-success py-2"
                    >
                      {loading ? "Completing..." : "Mark as Completed"}
                    </button>
                    {!showCancelReason ? (
                      <button
                        onClick={() => setShowCancelReason(true)}
                        className="w-full btn btn-secondary py-2"
                      >
                        Cancel Booking
                      </button>
                    ) : (
                      <>
                        <textarea
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="Please provide a reason for cancellation..."
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm"
                          rows="3"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleCancel}
                            disabled={loading}
                            className="flex-1 btn btn-danger py-2 text-sm"
                          >
                            {loading ? "Cancelling..." : "Confirm Cancellation"}
                          </button>
                          <button
                            onClick={() => setShowCancelReason(false)}
                            className="flex-1 btn btn-secondary py-2 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}

                {(booking.status === BOOKING_STATUS.CANCELLED ||
                  booking.status === BOOKING_STATUS.REJECTED ||
                  booking.status === BOOKING_STATUS.COMPLETED) && (
                    <button
                      onClick={onClose}
                      className="w-full btn btn-secondary py-2"
                    >
                      Close
                    </button>
                  )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
