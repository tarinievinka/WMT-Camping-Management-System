const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../src/models/user-model/userModel');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Drop problematic legacy index if it exists
    try {
      await User.collection.dropIndex('username_1');
      console.log('Dropped legacy username index');
    } catch (e) {
      // Ignore if index doesn't exist
    }

    const adminEmail = 'admin@camping.com';
    const adminPassword = 'admin123';

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = new User({
      name: 'System Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      userId: 'ADMIN001'
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@camping.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
};

createAdmin();
