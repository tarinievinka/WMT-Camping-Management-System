const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    const users = await db.collection('users').find({}).toArray();
    console.log(`Found ${users.length} users in 'users' collection`);
    if (users.length > 0) {
      console.log('First user:', { email: users[0].email, role: users[0].role });
    }
    
    // Check if there's a 'Users' collection (case sensitive)
    const usersUpper = await db.collection('Users').find({}).toArray();
    console.log(`Found ${usersUpper.length} users in 'Users' collection`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();
