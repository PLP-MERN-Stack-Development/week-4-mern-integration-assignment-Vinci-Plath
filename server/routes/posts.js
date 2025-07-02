import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  togglePinPost,
  getCategories,
  getComments,
  addComment,
  deleteComment
} from '../controllers/postController.js';

const router = express.Router();

// Post routes
router.route('/')
  .get(getPosts)
  .post(protect, createPost);

router.route('/:id')
  .get(getPost)
  .put(protect, updatePost)
  .delete(protect, deletePost);

router.put('/:id/pin', protect, togglePinPost);

// Categories (distinct from posts)
router.get('/categories', getCategories);

// Comments routes
router.get('/:id/comments', getComments);
router.post('/:id/comments', protect, addComment);
router.delete('/:postId/comments/:commentId', protect, deleteComment);

export default router; 