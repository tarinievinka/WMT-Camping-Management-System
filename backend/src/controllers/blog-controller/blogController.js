const Blog = require('../../models/blog-model/Blog');

// Get all blogs
exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.status(200).json(blogs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get single blog
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.status(200).json(blog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create blog
exports.createBlog = async (req, res) => {
    try {
        const { title, content, image, tags } = req.body;
        const blog = new Blog({
            title,
            content,
            author: req.user.id,
            authorName: req.user.name || 'Anonymous',
            image,
            tags
        });
        await blog.save();
        res.status(201).json(blog);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update blog
exports.updateBlog = async (req, res) => {
    try {
        let blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });

        // Check ownership or admin
        if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ error: 'Not authorized' });
        }

        blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(blog);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete blog
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });

        // Check ownership or admin
        if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ error: 'Not authorized' });
        }

        await blog.deleteOne();
        res.status(200).json({ message: 'Blog removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Like blog
exports.likeBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });

        if (blog.likes.includes(req.user.id)) {
            blog.likes = blog.likes.filter(id => id.toString() !== req.user.id);
        } else {
            blog.likes.push(req.user.id);
        }

        await blog.save();
        res.status(200).json(blog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Comment on blog
exports.commentBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });

        const newComment = {
            user: req.user.id,
            name: req.user.name || 'Anonymous',
            text: req.body.text
        };

        blog.comments.push(newComment);
        await blog.save();
        res.status(200).json(blog);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
