import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CommunityWall } from "../components/community";
import useCommunity from "../hooks/useCommunity";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Community = () => {
  const { user } = useAuth();
  const {
    posts,
    isLoading,
    error,
    fetchPosts,
    createPost,
    deletePost,
    likePost,
  } = useCommunity();
  const [userLikedPosts, setUserLikedPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreate = async (formData) => {
    try {
      await createPost(formData);
      toast.success("Post created successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to create post");
    }
  };

  const handlePostDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(postId);
        toast.success("Post deleted successfully!");
      } catch (err) {
        toast.error(err.message || "Failed to delete post");
      }
    }
  };

  const handleLike = async (postId) => {
    try {
      await likePost(postId);
      setUserLikedPosts((prev) =>
        prev.includes(postId)
          ? prev.filter((id) => id !== postId)
          : [...prev, postId],
      );
    } catch (err) {
      toast.error(err.message || "Failed to like post");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-8 pb-12"
    >
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
            Community Wall
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Connect with your neighbors, share announcements, and build stronger
            communities
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-2xl p-6 mb-6 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20"
          >
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        <CommunityWall
          posts={posts}
          isLoading={isLoading}
          onPostCreate={handlePostCreate}
          onPostDelete={handlePostDelete}
          canCreatePost={true}
          canDeletePost={(post) => post.author?._id === user?._id}
          onLike={handleLike}
          userLikedPosts={userLikedPosts}
        />
      </div>
    </motion.div>
  );
};

export default Community;
