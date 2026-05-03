const mongoose = require('mongoose');
require('dotenv').config();
const Feedback = require('./src/models/feedback & ticket-model/FeedbackModel');

async function checkAllFeedbacks() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const feedbacks = await Feedback.find();
    console.log(`Total Feedbacks: ${feedbacks.length}`);
    feedbacks.forEach(f => {
      console.log(`ID: ${f._id}, Target: ${f.targetName}, Type: ${f.targetType}, Rating: ${f.rating}, Images: ${f.imageUrls.length}, Date: ${f.createdAt}`);
      if (f.imageUrls.length > 0) console.log(`   URLs: ${JSON.stringify(f.imageUrls)}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAllFeedbacks();
