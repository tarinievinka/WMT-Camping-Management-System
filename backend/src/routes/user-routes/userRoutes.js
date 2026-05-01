const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user-controller/userController');
const { protect, adminOnly } = require('../../middleware/authMiddleware');

// Public
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.post('/refresh-token', userController.refreshToken);

// Authenticated user
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.delete('/profile', protect, userController.deleteMyProfile);

// Admin only
router.get('/', protect, adminOnly, userController.getAllUsers);
router.patch('/:id/status', protect, adminOnly, userController.setUserStatus);
router.patch('/:id/approve-owner', protect, adminOnly, userController.approveOwner);
router.patch('/:id/reject-owner', protect, adminOnly, userController.rejectOwner);
router.delete('/:id', protect, adminOnly, userController.deleteUser);

module.exports = router;