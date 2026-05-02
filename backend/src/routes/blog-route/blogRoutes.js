const express = require('express');
const router = express.Router();
const blogController = require('../../controllers/blog-controller/blogController');
const { protect } = require('../../middleware/authMiddleware');

// Public routes
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);

// Protected routes
router.post('/', protect, blogController.createBlog);
router.put('/:id', protect, blogController.updateBlog);
router.delete('/:id', protect, blogController.deleteBlog);
router.post('/:id/like', protect, blogController.likeBlog);
router.post('/:id/comment', protect, blogController.commentBlog);

module.exports = router;
