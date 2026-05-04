const express = require('express');
const router = express.Router();
const blogController = require('../../controllers/blog-controller/blogController');
const { protect } = require('../../middleware/authMiddleware');
<<<<<<< HEAD
const upload = require('../../middleware/uploadMiddleware');
=======
const upload = require('../../config/upload');
>>>>>>> 62f5f3323d328e9d8b5095180a339c2fe359b4b9

// Public routes
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);

// Image upload route (must come before /:id routes)
router.post('/upload-image', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file received' });
    const urlPath = `/uploads/${req.file.filename}`;
    return res.status(201).json({ urlPath });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

// Protected routes
router.post('/', protect, upload.array('images', 5), blogController.createBlog);
router.put('/:id', protect, upload.array('images', 5), blogController.updateBlog);
router.delete('/:id', protect, blogController.deleteBlog);
router.post('/:id/like', protect, blogController.likeBlog);
router.post('/:id/comment', protect, blogController.commentBlog);

module.exports = router;

