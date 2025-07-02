import Category from '../models/Category.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find();
  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin (for now, just Private)
export const createCategory = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;
  const category = await Category.create({ name, description });
  res.status(201).json({
    success: true,
    data: category
  });
}); 