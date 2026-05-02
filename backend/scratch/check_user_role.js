const mongoose = require('mongoose');
require('dotenv').config();

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://tarini:tarini123@cluster0.p7p6u.mongodb.net/smart-camping');
    const User = mongoose.connection.collection('users');
    const user = await User.findOne({ email: 'solohiker@gmail.com' });
    console.log(JSON.stringify(user, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUser();
