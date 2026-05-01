const mongoose = require('mongoose');
require('dotenv').config();

async function findAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const admin = await db.collection('users').findOne({ email: 'admin@camping.com' });
    if (admin) {
      console.log('Admin found:', { id: admin._id, email: admin.email, role: admin.role });
    } else {
      console.log('Admin NOT found with email admin@camping.com');
      // List all emails and roles
      const all = await db.collection('users').find({}).toArray();
      console.log('All users:', all.map(u => ({ email: u.email, role: u.role })));
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

findAdmin();
