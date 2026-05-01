const mongoose = require('mongoose');
const User = require('./src/models/user-model/userModel');
mongoose.connect('mongodb+srv://ineshrajapaksha:Inesh%2A123@cluster0.p7a08.mongodb.net/Smart_Camping_Management_System_dev?retryWrites=true&w=majority&appName=Cluster0')
.then(async () => {
  const users = await User.find({ role: 'campsite_owner' });
  console.log(users.map(u => ({ id: u._id, email: u.email, role: u.role })));
  process.exit(0);
});
