const mongoose = require('mongoose');
const User = require('./src/models/user-model/userModel');
require('dotenv').config();

async function auditUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`\nTotal users in DB: ${users.length}`);

    const inconsistent = users.filter(u => !u.name || (u.role && !['camper', 'guide', 'campsite_owner', 'admin'].includes(u.role)));

    if (inconsistent.length === 0) {
      console.log('No inconsistent records found.');
    } else {
      console.log(`Found ${inconsistent.length} inconsistent records:\n`);
      inconsistent.forEach(u => {
        console.log(`- ID: ${u._id}`);
        console.log(`  Name: ${u.name || 'MISSING'}`);
        console.log(`  Email: ${u.email || 'MISSING'}`);
        console.log(`  Role: ${u.role || 'MISSING'}`);
        console.log('---');
      });
      console.log('\nTo delete these corrupted records, run this script with --delete');
    }

    if (process.argv.includes('--delete')) {
      const ids = inconsistent.map(u => u._id);
      if (ids.length > 0) {
        await User.deleteMany({ _id: { $in: ids } });
        console.log(`\nDeleted ${ids.length} records.`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

auditUsers();
