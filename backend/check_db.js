const mongoose = require('mongoose');
require('dotenv').config();
const Feedback = require('./src/models/feedback & ticket-model/FeedbackModel');

async function checkFeedbacks() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(5);
    console.log('Recent Feedbacks:');
    feedbacks.forEach(f => {
      console.log(`ID: ${f._id}, Target: ${f.targetName}, TargetID: ${f.targetId}, Type: ${f.targetType}, Rating: ${f.rating}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkFeedbacks();
