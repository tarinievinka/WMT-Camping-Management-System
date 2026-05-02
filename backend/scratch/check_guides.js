const mongoose = require('mongoose');
const Guide = require('./backend/src/models/guide-model/guidemodel');

async function checkGuides() {
  try {
    await mongoose.connect('mongodb://localhost:27017/camping-management-system'); // Assuming this is the URI
    const guides = await Guide.find({}).limit(5);
    console.log(JSON.stringify(guides, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkGuides();
