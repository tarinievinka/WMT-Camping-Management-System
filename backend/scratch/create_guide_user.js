const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'camper' },
  isActive: { type: Boolean, default: true },
  guideStatus: { type: String, default: 'approved' },
  userId: String
});

const User = mongoose.model('User', UserSchema);

async function createGuide() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://tarini:tarini123@cluster0.p7p6u.mongodb.net/smart-camping');
    
    const email = 'solohiker@gmail.com';
    const password = 'guide123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const existing = await User.findOne({ email });
    if (existing) {
      existing.password = hashedPassword;
      existing.role = 'guide';
      existing.isActive = true;
      existing.guideStatus = 'approved';
      await existing.save();
      console.log('User updated successfully');
    } else {
      const user = new User({
        name: 'Solo Hiker',
        email: email,
        password: hashedPassword,
        role: 'guide',
        isActive: true,
        guideStatus: 'approved',
        userId: 'G-1001'
      });
      await user.save();
      console.log('User created successfully');
    }
    
    console.log('Email: solohiker@gmail.com');
    console.log('Password: guide123');
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createGuide();
