import { motion } from "framer-motion";
import { useState } from "react";
import CommunityPost from "./CommunityPost";
import PostForm from "./PostForm";
import { Loader } from "../common";

const CommunityWall = ({
  posts = [],
  isLoading = false,
  onPostCreate,
  onPostDelete,
  canCreatePost = true,
  canDeletePost = false,
  onLike,
  userLikedPosts = [],
}) => {
  const [showForm, setShowForm] = useState(false);

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Post Form */}
      {canCreatePost && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {showForm && (
            <PostForm
              onSubmit={(formData) => {
                onPostCreate(formData);
                setShowForm(false);
              }}
              isLoading={isLoading}
              onCancel={() => setShowForm(false)}
            />
          )}
          {!showForm && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(true)}
              className="w-full glass-strong rounded-2xl p-6 text-left hover:shadow-soft-lg transition-shadow"
            >
              <p className="text-gray-600 dark:text-gray-400">
                Share what's on your mind...
              </p>
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Posts Feed */}
      {posts.length === 0 && !isLoading ? (
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
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8zM9 13l4 4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {canCreatePost
              ? "Be the first to share something with your community"
              : "Check back later for community posts"}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {posts.map((post, index) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CommunityPost
                post={post}
                onDelete={onPostDelete}
                canDelete={canDeletePost}
                onLike={onLike}
                isLiked={userLikedPosts.includes(post._id)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Loading More */}
      {isLoading && posts.length > 0 && (
        <div className="flex justify-center py-8">
          <Loader size="md" />
        </div>
      )}
    </div>
  );
};

export default CommunityWall;
