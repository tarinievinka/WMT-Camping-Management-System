const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../../models/user-models/User');
const { protect } = require('../../utils/auth');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  console.log('Register route called with body:', req.body);
  const { username, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const allowedRoles = ['user', 'campsite-owner'];
    const userRole = allowedRoles.includes(role) ? role : 'user';

    const user = await User.create({ username, email, password, role: userRole, phone: req.body.phone || '' });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Hardcoded admin check
    if (username === 'admin' && password === 'admin123') {
      let adminUser = await User.findOne({ username: 'admin' });
      if (!adminUser) {
        adminUser = await User.create({
          username: 'admin',
          email: 'admin@campingsite.com',
          password: 'admin123',
          role: 'admin',
        });
      }
      return res.json({
        _id: adminUser._id,
        username: 'admin',
        email: adminUser.email,
        role: 'admin',
        token: generateToken(adminUser._id),
      });
    }

    const user = await User.findOne({ username });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({ _id: user._id, username: user.username, email: user.email, role: user.role });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

module.exports = router;
