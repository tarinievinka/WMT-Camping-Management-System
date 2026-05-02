const mongoose = require('mongoose');
require('dotenv').config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await mongoose.connection.db.collection('users').find().toArray();
    console.log('Users found:', users.length);
    users.forEach(u => {
      console.log(`ID: ${u._id}, Name: ${u.name}, Role: ${u.role}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkUsers();
