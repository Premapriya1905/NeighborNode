import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  MapPin,
  Clock,
  Star,
  Calendar,
  User,
  MessageCircle,
  Share2,
} from "lucide-react";
import { Avatar, Rating, Badge } from "../common";
import { ReviewForm, ReviewList } from "../reviews";
import { formatDate, formatCurrency } from "../../utils/formatters";
import toast from "react-hot-toast";

const ServiceDetailComponent = ({
  service,
  isLoading,
  onBook,
  onFavorite,
  isFavorite,
  isOwnService,
  reviews,
  reviewsLoading,
  onReviewSubmit,
  onReviewDelete,
}) => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    scheduledDate: "",
    scheduledTime: "",
    customerNote: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="inline-block p-3 rounded-full bg-primary-100 dark:bg-primary-900/20 mb-4">
            <svg
              className="w-12 h-12 text-primary-600 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p>Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <p className="text-lg text-gray-600">Service not found</p>
        </div>
      </div>
    );
  }

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!bookingData.scheduledDate || !bookingData.scheduledTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setBookingLoading(true);
    try {
      await onBook(bookingData);
      setBookingData({
        scheduledDate: "",
        scheduledTime: "",
        customerNote: "",
      });
      setShowBookingForm(false);
    } finally {
      setBookingLoading(false);
    }
  };

  const hasReviews = reviews && reviews.length > 0;
  const averageRating = hasReviews
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(
      1,
    )
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-8"
    >
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden"
          >
            {service.images && service.images.length > 0 ? (
              <img
                src={service.images[0]}
                alt={service.title}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                <svg
                  className="w-24 h-24 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </motion.div>

          {/* Service Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <Badge variant="primary" className="mb-3">
                  {service.category}
                </Badge>
                <h1 className="text-4xl font-display font-bold mb-3">
                  {service.title}
                </h1>
                <div className="flex items-center gap-4">
                  <Rating value={averageRating} showValue />
                  <span className="text-gray-600 dark:text-gray-400">
                    {hasReviews
                      ? `${reviews.length} reviews`
                      : "No reviews yet"}
                  </span>
                </div>
              </div>
              {!isOwnService && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onFavorite}
                  className={`p-3 rounded-full transition-colors ${isFavorite
                      ? "bg-red-100 dark:bg-red-900/20 text-red-500"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-600"
                    }`}
                >
                  <Heart
                    className="w-6 h-6"
                    fill={isFavorite ? "currentColor" : "none"}
                  />
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Provider Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-strong rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Service Provider</h3>
            <div className="flex items-center gap-4">
              <Avatar src={service.providerId?.profileImage} size="lg" />
              <div className="flex-1">
                <p className="font-semibold text-lg">
                  {service.providerId?.displayName || `${service.providerId?.firstName} ${service.providerId?.lastName}`}
                </p>
                <div className="flex items-center gap-2 mb-1">
                  <Rating
                    value={service.providerId?.rating}
                    size="sm"
                    showValue
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {service.providerId?.totalBookings || 0} bookings
                </p>
              </div>
            </div>
            {service.providerId?.bio && (
              <p className="mt-4 text-gray-700 dark:text-gray-300">
                {service.providerId.bio}
              </p>
            )}
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-4">About this service</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {service.description}
            </p>
          </motion.div>

          {/* Service Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-strong rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold mb-6">Service Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Duration
                  </span>
                </div>
                <p className="text-lg font-semibold">
                  {service.duration || 60} minutes
                </p>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Location
                  </span>
                </div>
                <p className="text-lg font-semibold">
                  {typeof service.location === "string"
                    ? service.location
                    : service.location?.street ||
                    service.location?.city ||
                    service.location?.buildingName ||
                    "Location not specified"}
                </p>
              </div>
              {service.availability && (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Available
                    </span>
                  </div>
                  <p className="text-lg font-semibold">
                    {Object.keys(service.availability).join(", ")}
                  </p>
                </div>
              )}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5 text-primary-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Bookings
                  </span>
                </div>
                <p className="text-lg font-semibold">
                  {service.totalBookings || 0} completed
                </p>
              </div>
            </div>
          </motion.div>

          {/* Reviews Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-6">Reviews</h2>

            {!isOwnService && (
              <ReviewForm
                onSubmit={onReviewSubmit}
                isLoading={bookingLoading}
                serviceName={service.title}
              />
            )}

            <ReviewList
              reviews={reviews || []}
              isLoading={reviewsLoading}
              onDelete={onReviewDelete}
              canDelete={true}
            />
          </motion.div>
        </div>

        {/* Sidebar - Booking Card */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-20 space-y-6"
          >
            {/* Price Card */}
            <div className="glass-strong rounded-2xl p-6">
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold">
                    {formatCurrency(service.pricing?.amount || 0)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {service.pricing?.type === "hourly" ? "per hour" : "fixed"}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <Clock className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium">
                    {service.duration || 60} minutes
                  </span>
                </div>
              </div>

              {!isOwnService ? (
                <>
                  {!showBookingForm ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowBookingForm(true)}
                      className="w-full btn btn-primary py-3 text-lg font-semibold mb-3"
                    >
                      <Calendar className="w-5 h-5" />
                      Book Service
                    </motion.button>
                  ) : (
                    <form onSubmit={handleBooking} className="space-y-4 mb-3">
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Date *
                        </label>
                        <input
                          type="date"
                          value={bookingData.scheduledDate}
                          onChange={(e) =>
                            setBookingData({
                              ...bookingData,
                              scheduledDate: e.target.value,
                            })
                          }
                          className="input w-full"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Time *
                        </label>
                        <input
                          type="time"
                          value={bookingData.scheduledTime}
                          onChange={(e) =>
                            setBookingData({
                              ...bookingData,
                              scheduledTime: e.target.value,
                            })
                          }
                          className="input w-full"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Note (Optional)
                        </label>
                        <textarea
                          value={bookingData.customerNote}
                          onChange={(e) =>
                            setBookingData({
                              ...bookingData,
                              customerNote: e.target.value,
                            })
                          }
                          placeholder="Any special requests..."
                          maxLength="200"
                          className="input w-full resize-none"
                          rows="3"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={bookingLoading}
                        className="w-full btn btn-primary py-2"
                      >
                        {bookingLoading ? "Booking..." : "Confirm Booking"}
                      </motion.button>
                      <button
                        type="button"
                        onClick={() => setShowBookingForm(false)}
                        className="w-full btn btn-secondary py-2"
                      >
                        Cancel
                      </button>
                    </form>
                  )}

                  <div className="border-t border-gray-200 dark:border-slate-700 pt-4 space-y-3">
                    <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Contact Provider
                      </span>
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Share Service</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    This is your service
                  </p>
                  <button className="w-full btn btn-secondary py-2">
                    Edit Service
                  </button>
                </div>
              )}
            </div>

            {/* Contact Card */}
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Provider Contact</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-500 italic">Hidden for privacy until booked</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceDetailComponent;
