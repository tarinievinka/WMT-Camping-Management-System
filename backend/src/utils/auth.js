const jwt = require('jsonwebtoken');
const User = require('../models/user-model/userModel');


const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log(`[AUTH] Verifying token: ${token.substring(0, 10)}...`);
      console.log(`[AUTH] Using secret ending in: ...${process.env.JWT_SECRET.slice(-3)}`);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(`[AUTH] Decoded ID: ${decoded.id}, Role: ${decoded.role}`);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        console.error(`[AUTH] User NOT found in DB for ID: ${decoded.id}`);
        return res.status(401).json({ message: 'User not found' });
      }
      
      console.log(`[AUTH] User authorized: ${req.user.email} (${req.user.role})`);
      next();
    } catch (error) {
      console.error(`[AUTH] Token verification FAILED: ${error.name} - ${error.message}`);
      return res.status(401).json({ message: `Not authorized, token failed: ${error.message}` });
    }
  }
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

const campsiteOwner = (req, res, next) => {
  if (req.user) {
    console.log(`[AUTH] Checking campsiteOwner role for: ${req.user.role}`);
    if (req.user.role === 'campsite_owner' || req.user.role === 'campsite-owner' || req.user.role === 'admin') {
      return next();
    }
  }
  console.warn(`[AUTH] Access DENIED for role: ${req.user?.role}`);
  res.status(401).json({ message: 'Not authorized as a campsite owner' });
};

module.exports = { protect, admin, campsiteOwner };
