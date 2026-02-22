import { motion } from "framer-motion";
import { Star, Trash2 } from "lucide-react";
import { Avatar, Rating } from "../common";
import { formatDate } from "../../utils/formatters";

const ReviewCard = ({ review, onDelete, canDelete = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="glass-strong rounded-2xl p-6 hover:shadow-soft-lg transition-shadow relative"
    >
      {/* Delete Button */}
      {canDelete && (
        <button
          onClick={() => onDelete(review._id)}
          className="absolute top-4 right-4 p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
        </button>
      )}

      {/* Header */}
      <div className="mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar src={review.reviewer?.avatar} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">
                {review.reviewer?.name || "Anonymous"}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(review.createdAt)}
              </p>
            </div>
          </div>
          <Rating value={review.rating} size="sm" showValue={false} />
        </div>
      </div>

      {/* Rating Display */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < review.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="font-bold text-lg">{review.rating}/5</span>
      </div>

      {/* Review Title */}
      {review.title && <h4 className="font-semibold mb-2">{review.title}</h4>}

      {/* Review Text */}
      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
        {review.text}
      </p>

      {/* Was This Helpful */}
      {review.helpfulCount !== undefined && (
        <div className="text-xs text-gray-500">
          👍 {review.helpfulCount} found this helpful
        </div>
      )}

      {/* Service Info */}
      {review.service && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Service: {review.service.title}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ReviewCard;
