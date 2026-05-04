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
            // Ensure image is set if images exist
            if (!blogObj.image && blogObj.images && blogObj.images.length > 0) {
                blogObj.image = blogObj.images[0];
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
        // Ensure image is set if images exist
        if (!blogObj.image && blogObj.images && blogObj.images.length > 0) {
            blogObj.image = blogObj.images[0];
        }


        res.status(200).json(blogObj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create blog
exports.createBlog = async (req, res) => {
    try {
        let { title, content, images, image, tags, category } = req.body;
        
        // Handle uploaded files
        let uploadedImages = [];
        if (req.files && req.files.length > 0) {
            uploadedImages = req.files.map(file => `/uploads/${file.filename}`);
        }

        // Handle images from body (could be URLs or existing images)
        let bodyImages = [];
        const imagesData = req.body.urlImages || req.body.images;
        if (imagesData) {
            try {
                bodyImages = typeof imagesData === 'string' ? JSON.parse(imagesData) : imagesData;
            } catch (e) {
                bodyImages = [imagesData];
            }
        }


        const finalImages = [...uploadedImages, ...bodyImages];
        console.log('[DEBUG] Final Images for Create:', finalImages);
        
        // Handle tags (could be JSON string if using FormData)

        let finalTags = tags || [];
        if (typeof tags === 'string' && tags.startsWith('[')) {
            try {
                finalTags = JSON.parse(tags);
            } catch (e) {
                finalTags = tags.split(',').map(t => t.trim());
            }
        } else if (typeof tags === 'string') {
            finalTags = tags.split(',').map(t => t.trim()).filter(t => t !== "");
        }

        const blog = new Blog({
            title,
            content,
            author: req.user.id,
            authorName: req.user.role === 'admin' ? 'Admin' : (req.user.name || req.user.username || 'Anonymous'),
            authorRole: req.user.role || 'user',
            category: category || 'General',
            images: finalImages,
            image: finalImages.length > 0 ? finalImages[0] : (image || ''),
            tags: finalTags
        });
        await blog.save();
        res.status(201).json(blog);
    } catch (err) {
        console.error('Create Blog Error:', err);
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
        if (authorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ error: 'Not authorized' });
        }

        let updateData = { ...req.body };

        // Handle uploaded files
        let uploadedImages = [];
        if (req.files && req.files.length > 0) {
            uploadedImages = req.files.map(file => `/uploads/${file.filename}`);
        }

        // Handle images from body
        let bodyImages = [];
        const imagesData = updateData.urlImages || updateData.images;
        if (imagesData) {
            try {
                bodyImages = typeof imagesData === 'string' ? JSON.parse(imagesData) : imagesData;
            } catch (e) {
                bodyImages = [imagesData];
            }
        }


        const finalImages = [...uploadedImages, ...bodyImages];
        console.log('[DEBUG] Final Images for Update:', finalImages);
        if (finalImages.length > 0) {

            updateData.images = finalImages;
            updateData.image = finalImages[0];
        }

        // Handle tags
        if (updateData.tags) {
            if (typeof updateData.tags === 'string' && updateData.tags.startsWith('[')) {
                try {
                    updateData.tags = JSON.parse(updateData.tags);
                } catch (e) {
                    updateData.tags = updateData.tags.split(',').map(t => t.trim());
                }
            } else if (typeof updateData.tags === 'string') {
                updateData.tags = updateData.tags.split(',').map(t => t.trim()).filter(t => t !== "");
            }
        }

        blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.status(200).json(blog);
    } catch (err) {
        console.error('Update Blog Error:', err);
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
