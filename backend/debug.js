const mongoose = require('mongoose');
const Campsite = require('./src/models/campsite-model/CampsiteModel');
mongoose.connect('mongodb+srv://ineshrajapaksha:Inesh%2A123@cluster0.p7a08.mongodb.net/Smart_Camping_Management_System_dev?retryWrites=true&w=majority&appName=Cluster0')
.then(async () => {
  const c = await Campsite.find().sort({createdAt: -1}).limit(3);
  console.log(c.map(x => ({ id: x._id, name: x.name, ownerId: x.ownerId })));
  process.exit(0);
});
