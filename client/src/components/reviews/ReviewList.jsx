import { motion } from "framer-motion";
import ReviewCard from "./ReviewCard";
import { Loader } from "../common";

const ReviewList = ({
  reviews = [],
  isLoading = false,
  onDelete,
  canDelete = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="inline-block p-4 rounded-full bg-primary-100 dark:bg-primary-900/20 mb-4">
          <svg
            className="w-8 h-8 text-primary-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Be the first to review this service
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Reviews ({reviews.length})</h3>

        {/* Overall Rating */}
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">
              {(
                reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
              ).toFixed(1)}
            </span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i <
                    Math.round(
                      reviews.reduce((sum, r) => sum + r.rating, 0) /
                        reviews.length,
                    )
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {reviews.map((review, index) => (
          <motion.div
            key={review._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ReviewCard
              review={review}
              onDelete={onDelete}
              canDelete={canDelete}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
