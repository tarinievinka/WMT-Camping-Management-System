const Blog = require('../../models/blog-model/Blog');

// Get all blogs
exports.getAllBlogs = async (req, res) => {
    try {
        console.log('GET /api/blogs - Params:', req.query);
        let query = {};
        
        // Category filter
        if (req.query.category && req.query.category !== 'All') {
            query.category = req.query.category;
        }

        // Search functionality (title, authorName, or category)
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            query.$or = [
                { title: searchRegex },
                { authorName: searchRegex },
                { category: searchRegex }
            ];
        }

        const blogs = await Blog.find(query).sort({ createdAt: -1 }).populate('author', 'role');
        const formattedBlogs = blogs.map(blog => {
            const blogObj = blog.toObject();
            if (blogObj.author && blogObj.author.role) {
                if (blogObj.author.role === 'admin') {
                    blogObj.authorRole = 'admin';
                }
            }
            if (blogObj.authorRole === 'admin') {
                blogObj.authorName = 'Admin';
            }
            // Ensure images is always an array (backward compatibility)
            if (blogObj.image && (!blogObj.images || blogObj.images.length === 0)) {
                blogObj.images = [blogObj.image];
            }
            return blogObj;
        });
        res.status(200).json(formattedBlogs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get single blog
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author', 'role');
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        
        const blogObj = blog.toObject();
        if (blogObj.author && blogObj.author.role) {
            if (blogObj.author.role === 'admin') {
                blogObj.authorRole = 'admin';
            }
        }
        if (blogObj.authorRole === 'admin') {
            blogObj.authorName = 'Admin';
        }

        // Ensure images is always an array
        if (blogObj.image && (!blogObj.images || blogObj.images.length === 0)) {
            blogObj.images = [blogObj.image];
        }

        res.status(200).json(blogObj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create blog
exports.createBlog = async (req, res) => {
    try {
        const { title, content, images, image, tags, category } = req.body;
        const blog = new Blog({
            title,
            content,
            author: req.user.id,
            authorName: req.user.role === 'admin' ? 'Admin' : (req.user.name || req.user.username || 'Anonymous'),
            authorRole: req.user.role || 'user',
            category: category || 'General',
            images: images && images.length > 0 ? images : (image ? [image] : []),
            image: (images && images.length > 0) ? images[0] : (image || ''),
            tags: tags || []
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

        // Check ownership (Strict: Only author can update)
        const authorId = blog.author._id ? blog.author._id.toString() : blog.author.toString();
        if (authorId !== req.user.id) {
            return res.status(401).json({ error: 'Not authorized' });
        }


        // If images are provided, update the legacy 'image' field too
        if (req.body.images && req.body.images.length > 0) {
            req.body.image = req.body.images[0];
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

        // Check ownership (Strict: Only author can delete)
        const authorId = blog.author._id ? blog.author._id.toString() : blog.author.toString();
        if (authorId !== req.user.id) {
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
