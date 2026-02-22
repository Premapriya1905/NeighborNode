import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Trash2 } from "lucide-react";
import { Avatar, Badge } from "../common";
import { formatDate } from "../../utils/formatters";

const CommunityPost = ({
  post,
  onDelete,
  canDelete = false,
  onLike,
  isLiked = false,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [userLiked, setUserLiked] = useState(isLiked);

  const handleLike = () => {
    setUserLiked(!userLiked);
    setLikeCount(userLiked ? likeCount - 1 : likeCount + 1);
    onLike?.(post._id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-6 hover:shadow-soft-lg transition-shadow"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar src={post.author?.avatar} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">
              {post.author?.name || "Community Member"}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        {canDelete && (
          <button
            onClick={() => onDelete(post._id)}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-2"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        )}
      </div>

      {/* Category Badge */}
      {post.category && (
        <div className="mb-3">
          <Badge variant="primary">{post.category}</Badge>
        </div>
      )}

      {/* Title */}
      {post.title && (
        <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
      )}

      {/* Content */}
      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-4">
        {post.content}
      </p>

      {/* Image */}
      {post.image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 rounded-xl overflow-hidden max-h-48"
        >
          <img
            src={post.image}
            alt={post.title || "Post image"}
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}

      {/* Engagement Stats */}
      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
        <span>{likeCount} likes</span>
        <span>{post.comments?.length || 0} comments</span>
        <span>{post.shares || 0} shares</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 items-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
            userLiked
              ? "bg-red-100 dark:bg-red-900/20 text-red-600"
              : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600"
          }`}
        >
          <Heart
            className="w-4 h-4"
            fill={userLiked ? "currentColor" : "none"}
          />
          <span className="text-sm font-medium">Like</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Comment</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-sm font-medium">Share</span>
        </motion.button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700"
        >
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment._id} className="flex gap-2">
                  <Avatar src={comment.author?.avatar} size="sm" />
                  <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-3">
                    <p className="text-xs font-semibold">
                      {comment.author?.name}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-3">
                No comments yet
              </p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CommunityPost;
