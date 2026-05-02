const mongoose = require('mongoose');
const User = require('./src/models/user-model/userModel');
const bcrypt = require('bcryptjs');
const { generateUserId } = require('./src/utils/userUtils');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@camping.com';
    const existing = await User.findOne({ email: adminEmail });

    if (existing) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const userId = generateUserId('admin');

    const admin = new User({
      name: 'System Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      userId: userId,
      isActive: true
    });

    await admin.save();
    console.log('Admin created successfully!');
    console.log('Email: admin@camping.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
