const mongoose = require('mongoose');
require('dotenv').config();

async function linkGuide() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://tarini:tarini123@cluster0.p7p6u.mongodb.net/smart-camping');
    const User = mongoose.connection.collection('users');
    const Guide = mongoose.connection.collection('guides');
    
    const user = await User.findOne({ email: 'solohiker@gmail.com' });
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }
    
    const guide = await Guide.findOne({ email: 'solohiker@gmail.com' });
    if (!guide) {
      console.log('Guide profile not found. Creating one...');
      const newGuide = {
        name: user.name,
        email: user.email,
        userId: user._id,
        nic: '123456789V',
        age: 28,
        dailyRate: 5000,
        specialties: ['Hiking', 'Trekking'],
        availability: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await Guide.insertOne(newGuide);
      console.log('Guide profile created and linked');
    } else {
      await Guide.updateOne({ _id: guide._id }, { $set: { userId: user._id } });
      console.log('Guide profile linked to User ID:', user._id);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

linkGuide();
