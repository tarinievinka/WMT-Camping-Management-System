const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const User = require('./src/models/user-model/userModel');
require('dotenv').config({ path: './.env' });

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    const users = await User.find({}, 'name email role createdAt');
    console.log('\n=== REGISTERED USERS ===');
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      users.forEach(u => console.log(JSON.stringify(u, null, 2)));
    }
    console.log('========================\n');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkUsers();
