const mongoose = require('mongoose');
require('dotenv').config();
const Campsite = require('./src/models/campsite-model/CampsiteModel');

async function checkCampsites() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const campsites = await Campsite.find();
    console.log('Campsites:');
    campsites.forEach(c => {
      console.log(`ID: ${c._id}, Name: ${c.name}, Rating: ${c.averageRating}, Count: ${c.numReviews}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCampsites();
