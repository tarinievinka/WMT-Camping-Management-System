const User = require('../../models/user-model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { generateUserId } = require('../../utils/userUtils');
const { sendEmail } = require('../../utils/emailUtils');

const registerUser = async (data) => {
  const email = data.email.toLowerCase().trim();
  console.log(`[USER_SERVICE] Registering user: ${email} with role: ${data.role}`);
  const existing = await User.findOne({ email });
  if (existing) throw new Error('Email already registered');

  const passwordToHash = data.password || crypto.randomBytes(8).toString('hex');
  const hashed = await bcrypt.hash(passwordToHash, 10);
  const userId = generateUserId(data.role || 'camper');

  const isActive = !(data.role === 'guide' || data.role === 'campsite_owner');
  const user = new User({ ...data, password: hashed, userId, isActive });
  const savedUser = await user.save();
  console.log(`[USER_SERVICE] User saved: ${savedUser._id} (Name: ${savedUser.name}, Role: ${savedUser.role})`);
  return savedUser;
};

const loginUser = async (emailRaw, password) => {
  const email = emailRaw.toLowerCase().trim();
  console.log(`[USER_SERVICE] Attempting login for: ${email}`);
  const user = await User.findOne({ email });
  
  if (!user) {
    console.log(`[USER_SERVICE] Login failed: User not found (${email})`);
    throw new Error('User not found');
  }

  if (!user.isActive) {
    console.log(`[USER_SERVICE] Login failed: Account deactivated for ${email}`);
    if (user.role === 'guide') {
      if (user.guideStatus === 'pending') throw new Error('Your guide application is pending admin approval');
      if (user.guideStatus === 'rejected') throw new Error('Your guide application was rejected');
    }
    if (user.role === 'campsite_owner') {
      if (user.ownerStatus === 'pending') throw new Error('Your campsite owner application is pending admin approval');
      if (user.ownerStatus === 'rejected') throw new Error('Your campsite owner application was rejected');
    }
    throw new Error('Account is deactivated');
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    console.log(`[USER_SERVICE] Login failed: Invalid password for ${email}`);
    throw new Error('Invalid credentials');
  }

  console.log(`[USER_SERVICE] Login successful for: ${email} (Role: ${user.role})`);

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } 
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret_123',
    { expiresIn: '7d' }
  );

  user.refreshToken = refreshToken;
  await user.save();

  return { token, refreshToken, user };
};

const refreshAccessToken = async (token) => {
  if (!token) throw new Error('Refresh token required');
  
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_secret_123');
  const user = await User.findById(decoded.id);
  
  if (!user || user.refreshToken !== token) {
    throw new Error('Invalid refresh token');
  }

  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  return { token: accessToken };
};

const getUserById = async (id) => {
  return await User.findById(id).select('-password');
};

const updateUser = async (id, data) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  return await User.findByIdAndUpdate(id, data, { new: true }).select('-password');
};


const toggleUserStatus = async (id, isActive) => {
  return await User.findByIdAndUpdate(
    id,
    { isActive: isActive },
    { new: true }
  );
};
const getAllUsers = async () => {
  return await User.find().select('-password');
};

const Guide = require('../../models/guide-model/guidemodel');

const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new Error('User not found');

  // Also delete associated Guide profile if any
  await Guide.findOneAndDelete({ 
    $or: [
      { userId: id },
      { email: user.email }
    ]
  });

  return user;
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new Error('No user found with this email');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  user.resetPasswordExpire = Date.now() + 3600000;
  
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/login/forgot?token=${resetToken}`;
  
  const message = `
    <h1>Password Reset Request</h1>
    <p>You requested to reset your password. Click the link below to set a new password:</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #10a110; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  // Development mode: Log token to console instead of sending email
  console.log('\n=== PASSWORD RESET TOKEN (Development Mode) ===');
  console.log(`Email: ${user.email}`);
  console.log(`Reset Token: ${resetToken}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log('================================================\n');

  try {
    await sendEmail({
      email: user.email,
      subject: 'Smart Camping - Password Reset Request',
      message,
    });
  } catch (err) {
    // If email fails, still allow development testing
    console.log('Email sending failed, but token is logged for development testing');
  }

  return resetToken;
};

const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  
  await user.save();

  return user;
};

module.exports = { registerUser, loginUser, getUserById, updateUser, toggleUserStatus, getAllUsers, deleteUser, forgotPassword, resetPassword, refreshAccessToken };