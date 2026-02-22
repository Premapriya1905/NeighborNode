import express from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  togglePin,
  archivePost,
  getPostsByType
} from '../controllers/communityController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { adminOnly } from '../middleware/roleCheck.js';

const router = express.Router();

// Public routes
router.get('/posts', optionalAuth, getPosts);
router.get('/posts/type/:type', getPostsByType);
router.get('/posts/:id', optionalAuth, getPostById);

// Protected routes
router.use(protect);

router.post('/posts', createPost);
router.put('/posts/:id', updatePost);
router.delete('/posts/:id', deletePost);
router.post('/posts/:id/like', toggleLike);
router.post('/posts/:id/comment', addComment);
router.delete('/posts/:id/comment/:commentId', deleteComment);

// Admin routes
router.patch('/posts/:id/pin', adminOnly, togglePin);
router.patch('/posts/:id/archive', adminOnly, archivePost);

export default router;