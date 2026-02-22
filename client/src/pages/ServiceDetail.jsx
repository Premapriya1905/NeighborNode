import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ServiceDetailComponent from "../components/services/ServiceDetail";
import useServices from "../hooks/useServices";
import useReviews from "../hooks/useReviews";
import useBookings from "../hooks/useBookings";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import api from "../services/api";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { service, isLoading, error, fetchServiceById, toggleFavorite } =
    useServices();
  const {
    reviews,
    isLoading: reviewsLoading,
    fetchReviews,
    createReview,
    deleteReview,
  } = useReviews(id);
  const { createBooking } = useBookings();

  const [isFavorite, setIsFavorite] = useState(false);
  const [bookingCreating, setBookingCreating] = useState(false);

  // Fetch service and reviews
  useEffect(() => {
    if (id) {
      fetchServiceById(id);
      fetchReviews();
      checkIfFavorite();
    }
  }, [id]);

  // Check if service is favorited
  const checkIfFavorite = async () => {
    try {
      const response = await api.get(`/services/${id}/is-favorite`);
      setIsFavorite(response.data.data?.isFavorite || false);
    } catch (err) {
      console.error("Error checking favorite status:", err);
    }
  };

  // Handle booking
  const handleBooking = async (bookingData) => {
    if (!user) {
      toast.error("Please log in to book a service");
      navigate("/login");
      return;
    }

    if (user._id === service?.provider?._id) {
      toast.error("You can't book your own service");
      return;
    }

    setBookingCreating(true);
    try {
      const payload = {
        serviceId: id,
        providerId: service.provider._id,
        scheduledDate: bookingData.scheduledDate,
        scheduledTime: bookingData.scheduledTime,
        customerNote: bookingData.customerNote,
        duration: service.duration,
      };
      await createBooking(payload);
      toast.success("Service booked successfully!");
      navigate("/bookings");
    } catch (err) {
      toast.error(err.message || "Failed to book service");
    } finally {
      setBookingCreating(false);
    }
  };

  // Handle favorite toggle
  const handleFavorite = async () => {
    if (!user) {
      toast.error("Please log in to save services");
      navigate("/login");
      return;
    }

    try {
      await toggleFavorite(id);
      setIsFavorite(!isFavorite);
      toast.success(
        isFavorite ? "Removed from favorites" : "Added to favorites",
      );
    } catch (err) {
      toast.error(err.message || "Failed to toggle favorite");
    }
  };

  // Handle review submission
  const handleReviewSubmit = async (reviewData) => {
    if (!user) {
      toast.error("Please log in to leave a review");
      navigate("/login");
      return;
    }

    try {
      await createReview(reviewData);
      toast.success("Review posted successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to post review");
    }
  };

  // Handle review deletion
  const handleReviewDelete = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      toast.success("Review deleted successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to delete review");
    }
  };

  const isOwnService = user?._id === service?.provider?._id;

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen pt-8 pb-12"
      >
        <div className="container-custom">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 text-primary-600 hover:text-primary-700 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          <div className="text-center py-12">
            <div className="inline-block p-4 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Service Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => navigate("/services")}
              className="btn btn-primary"
            >
              Browse Services
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-8 pb-12"
    >
      <div className="container-custom max-w-6xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-primary-600 hover:text-primary-700 flex items-center gap-2 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        <ServiceDetailComponent
          service={service}
          isLoading={isLoading}
          onBook={handleBooking}
          onFavorite={handleFavorite}
          isFavorite={isFavorite}
          isOwnService={isOwnService}
          reviews={reviews}
          reviewsLoading={reviewsLoading}
          onReviewSubmit={handleReviewSubmit}
          onReviewDelete={handleReviewDelete}
        />
      </div>
    </motion.div>
  );
};

export default ServiceDetail;
