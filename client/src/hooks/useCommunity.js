import { useState, useCallback } from 'react';
import api from '../services/api';

const useCommunity = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all posts
  const fetchPosts = useCallback(async (filters = {}) => {
    setIsLoading(true);
    try {
      const response = await api.get('community/posts', { params: filters });
      setPosts(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch posts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create post
  const createPost = useCallback(async (postData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', postData.title || '');
      formData.append('content', postData.content);
      formData.append('category', postData.category || 'General');
      
      if (postData.image) {
        formData.append('image', postData.image);
      }

      const response = await api.post('community/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPosts((prev) => [response.data, ...prev]);
      setError(null);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create post';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update post
  const updatePost = useCallback(async (postId, updateData) => {
    setIsLoading(true);
    try {
      const response = await api.patch(`community/posts/${postId}`, updateData);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? response.data : p))
      );
      setError(null);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update post';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete post
  const deletePost = useCallback(async (postId) => {
    setIsLoading(true);
    try {
      await api.delete(`community/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setError(null);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete post';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Like post
  const likePost = useCallback(async (postId) => {
    try {
      const response = await api.post(`community/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? response.data : p))
      );
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to like post');
    }
  }, []);

  // Add comment
  const addComment = useCallback(async (postId, commentData) => {
    try {
      const response = await api.post(
        `community/posts/${postId}/comments`,
        commentData
      );
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? response.data : p))
      );
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to add comment');
    }
  }, []);

  // Delete comment
  const deleteComment = useCallback(async (postId, commentId) => {
    try {
      const response = await api.delete(
        `community/posts/${postId}/comments/${commentId}`
      );
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? response.data : p))
      );
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete comment');
    }
  }, []);

  return {
    posts,
    isLoading,
    error,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    likePost,
    addComment,
    deleteComment
  };
};

export default useCommunity;
