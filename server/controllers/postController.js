import Post from '../models/Post.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private
export const getPosts = asyncHandler(async (req, res, next) => {
  const { category, search, page = 1, limit = 10, sort = '-updatedAt' } = req.query;
  const query = {};
  if (category) query.category = category;
  if (search) query.$text = { $search: search };
  const skip = (page - 1) * limit;
  const total = await Post.countDocuments(query);
  let dbQuery = Post.find(query).populate('category', 'name');
  dbQuery = dbQuery.sort(sort.startsWith('-') ? { [sort.slice(1)]: -1 } : { [sort]: 1 });
  const posts = await dbQuery.skip(skip).limit(Number(limit));
  res.status(200).json({ success: true, count: posts.length, total, data: posts });
});

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Private
export const getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate('category', 'name');
  if (!post) return next(new ErrorResponse('Post not found', 404));
  res.status(200).json({ success: true, data: post });
});

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
export const createPost = asyncHandler(async (req, res, next) => {
  req.body.author = req.user.id;
  const post = await Post.create(req.body);
  res.status(201).json({ success: true, data: post });
});

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = asyncHandler(async (req, res, next) => {
  let post = await Post.findById(req.params.id);
  if (!post) return next(new ErrorResponse('Post not found', 404));
  if (post.author.toString() !== req.user.id) return next(new ErrorResponse('Not authorized', 401));
  post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: post });
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new ErrorResponse('Post not found', 404));
  if (post.author.toString() !== req.user.id) return next(new ErrorResponse('Not authorized', 401));
  await post.remove();
  res.status(200).json({ success: true, data: {} });
});

// @desc    Toggle pin status of a post
// @route   PUT /api/posts/:id/pin
// @access  Private
export const togglePinPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new ErrorResponse('Post not found', 404));
  if (post.author.toString() !== req.user.id) return next(new ErrorResponse('Not authorized', 401));
  post.isPinned = !post.isPinned;
  await post.save();
  res.status(200).json({ success: true, data: post });
});

// @desc    Get all categories for posts (distinct)
// @route   GET /api/posts/categories
// @access  Private
export const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Post.distinct('category');
  res.status(200).json({ success: true, count: categories.length, data: categories });
});

// @desc    Get all comments for a post
// @route   GET /api/posts/:id/comments
// @access  Public
export const getComments = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate('comments.user', 'username');
  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }
  res.status(200).json({
    success: true,
    count: post.comments.length,
    data: post.comments
  });
});

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }
  const { content } = req.body;
  if (!content || !content.trim()) {
    return next(new ErrorResponse('Comment content is required', 400));
  }
  post.comments.push({ user: req.user.id, content });
  await post.save();
  await post.populate('comments.user', 'username');
  res.status(201).json({
    success: true,
    data: post.comments[post.comments.length - 1]
  });
});

// @desc    Delete a comment from a post
// @route   DELETE /api/posts/:postId/comments/:commentId
// @access  Private (only comment owner or post owner)
export const deleteComment = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);
  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }
  const comment = post.comments.id(req.params.commentId);
  if (!comment) {
    return next(new ErrorResponse('Comment not found', 404));
  }
  // Only comment owner or post owner can delete
  if (
    comment.user.toString() !== req.user.id &&
    post.author.toString() !== req.user.id
  ) {
    return next(new ErrorResponse('Not authorized to delete this comment', 401));
  }
  comment.remove();
  await post.save();
  res.status(200).json({ success: true, data: {} });
});

// export { getPosts, getPost, createPost, updatePost, deletePost, togglePinPost, getCategories, getComments, addComment, deleteComment }; 