import express from 'express';
import { check } from 'express-validator';
import { getCategories, createCategory } from '../controllers/categoryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(
    protect,
    [check('name', 'Please provide a category name').not().isEmpty()],
    createCategory
  );

export default router; 