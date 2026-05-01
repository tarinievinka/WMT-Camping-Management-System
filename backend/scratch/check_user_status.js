const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/user-model/userModel');

async function checkUser(email) {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/camping');
    const user = await User.findOne({ email });
    if (user) {
        console.log('User Found:');
        console.log('Name:', user.name);
        console.log('Role:', user.role);
        console.log('Guide Status:', user.guideStatus);
        console.log('Guide Application:', JSON.stringify(user.guideApplication, null, 2));
    } else {
        console.log('User not found');
    }
    await mongoose.disconnect();
}

const email = process.argv[2];
if (email) {
    checkUser(email);
} else {
    console.log('Please provide an email');
}
