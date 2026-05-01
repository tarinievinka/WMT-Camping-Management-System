const mongoose = require('mongoose');
const User = require('../src/models/user-model/userModel');
require('dotenv').config({ path: './.env' });

async function checkPendingGuides() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    const pendingGuides = await User.find({ role: 'guide', guideStatus: 'pending' });
    console.log('\n=== PENDING GUIDE APPLICATIONS ===');
    if (pendingGuides.length === 0) {
      console.log('No pending guides found.');
    } else {
      pendingGuides.forEach(u => console.log(JSON.stringify(u, null, 2)));
    }
    console.log('===================================\n');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkPendingGuides();
