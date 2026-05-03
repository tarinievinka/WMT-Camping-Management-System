const mongoose = require('mongoose');
require('dotenv').config();
const Equipment = require('./src/models/Equipment-model/EquipmentModel');
const Feedback = require('./src/models/feedback & ticket-model/FeedbackModel');

async function checkEquipment() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const items = await Equipment.find();
    console.log('Equipment Items:');
    items.forEach(e => {
      console.log(`ID: ${e._id}, Name: ${e.name}, Rating: ${e.averageRating}, Count: ${e.numReviews}`);
    });
    
    const feedbacks = await Feedback.find({ targetType: 'Equipment' }).sort({ createdAt: -1 }).limit(5);
    console.log('\nRecent Equipment Feedbacks:');
    feedbacks.forEach(f => {
      console.log(`ID: ${f._id}, Target: ${f.targetName}, TargetID: ${f.targetId}, Rating: ${f.rating}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkEquipment();
