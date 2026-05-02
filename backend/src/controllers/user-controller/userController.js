const userService = require('../../services/user-service/userService');
const User = require('../../models/user-model/userModel');

const jwt = require('jsonwebtoken'); // Added for token generation on register

const register = async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);
    
    // Generate token for auto-login
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || 'refresh_secret_123',
      { expiresIn: '7d' }
    );

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({ 
      message: 'User registered successfully', 
      token, 
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userId: user.userId
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[AUTH] Login attempt for email: ${email}`);
    const result = await userService.loginUser(email, password);
    res.status(200).json(result);
  } catch (err) {
    console.error(`[AUTH] Login error for ${req.body.email}: ${err.message}`);
    // Distinguish between credential errors and server errors
    const status = (err.message === 'User not found' || err.message === 'Invalid credentials') ? 401 : 400;
    res.status(status).json({ error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.profilePicture = `/uploads/${req.file.filename}`;
    }
    const user = await userService.updateUser(req.user.id, updateData);
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin only
const setUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const isActive = req.body.isActive === true || req.body.isActive === 'true'; // 👈 fix this line
    const user = await userService.toggleUserStatus(id, isActive);
    res.status(200).json({
      message: `User ${isActive ? 'activated' : 'deactivated'}`,
      user
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.deleteUser(id);
    res.status(200).json({
      message: `User deleted`,
      user
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteMyProfile = async (req, res) => {
  try {
    const user = await userService.deleteUser(req.user.id);
    res.status(200).json({
      message: `Profile deleted successfully`,
      user
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const resetToken = await userService.forgotPassword(email);
    
    // Return token in development mode for testing
    res.status(200).json({ 
      message: 'Password reset email sent successfully',
      resetToken: resetToken,
      note: 'Development mode: Token returned for testing'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const approveOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 1. Generate a random temporary password
    const crypto = require('crypto');
    const bcrypt = require('bcryptjs');
    const tempPassword = crypto.randomBytes(4).toString('hex'); // 8 characters
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 2. Update user status and password
    await User.findByIdAndUpdate(id, {
      ownerStatus: 'approved',
      isActive: true,
      password: hashedPassword
    });

    // 3. Send approval email
    const { sendEmail } = require('../../utils/emailUtils');
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; borderRadius: 12px;">
        <h1 style="color: #10a110; text-align: center;">Welcome to Smart Camping!</h1>
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Congratulations! Your application to become a <strong>Campsite Owner</strong> has been approved.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #f1f5f9;">
          <p style="margin-top: 0;"><strong>Your Login Credentials:</strong></p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Temporary Password:</strong> <span style="font-family: monospace; font-size: 16px; background: #fff; padding: 4px 8px; border: 1px dashed #cbd5e1; border-radius: 4px;">${tempPassword}</span></p>
        </div>

        <p>You can now log in to your dashboard to manage your campsite listings:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${loginUrl}" style="background-color: #10a110; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Log in to Dashboard</a>
        </div>

        <p style="color: #64748b; font-size: 14px;"><em>For security reasons, we recommend changing your password after your first login.</em></p>
        
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 32px 0;" />
        <p style="text-align: center; color: #94a3b8; font-size: 12px;">© 2026 Smart Camping Management System. All rights reserved.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Smart Camping - Campsite Owner Application Approved!',
        message,
      });
    } catch (emailErr) {
      console.error("Owner approval email notification failed:", emailErr);
    }

    res.status(200).json({ message: 'Campsite owner approved and notified successfully', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const rejectOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { ownerStatus: 'rejected', isActive: false },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ message: 'Campsite owner application rejected', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    
    await userService.resetPassword(token, newPassword);
    res.status(200).json({ 
      message: 'Password reset successfully' 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    const result = await userService.refreshAccessToken(token);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

module.exports = { register, login, getProfile, updateProfile, setUserStatus, deleteUser, deleteMyProfile, getAllUsers, forgotPassword, resetPassword, approveOwner, rejectOwner, refreshToken };