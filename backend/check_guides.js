const mongoose = require('mongoose');
require('dotenv').config();
const Guide = require('./src/models/guide-model/guidemodel');
const Feedback = require('./src/models/feedback & ticket-model/FeedbackModel');

async function checkGuides() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const guides = await Guide.find();
    console.log('Guides:');
    guides.forEach(g => {
      console.log(`ID: ${g._id}, Name: ${g.name}, Rating: ${g.averageRating}, Count: ${g.numReviews}`);
    });
    
    const feedbacks = await Feedback.find({ targetType: 'Guide' }).sort({ createdAt: -1 }).limit(5);
    console.log('\nRecent Guide Feedbacks:');
    feedbacks.forEach(f => {
      console.log(`ID: ${f._id}, Target: ${f.targetName}, TargetID: ${f.targetId}, Rating: ${f.rating}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkGuides();
