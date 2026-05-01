const mongoose = require('mongoose');
const Campsite = require('../src/models/campsite-model/CampsiteModel');
const Feedback = require('../src/models/feedback-model/FeedbackModel');
require('dotenv').config();

async function debugGetAll() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const filter = {};
    const campsites = await Campsite.find(filter).lean();
    console.log(`Found ${campsites.length} campsites`);
    
    const allFeedbacks = await Feedback.find({ targetType: 'Campsite' }).lean();
    console.log(`Found ${allFeedbacks.length} feedbacks`);

    const dataWithRatings = campsites.map(site => {
      const siteFeedbacks = allFeedbacks.filter(f => 
        String(f.targetId || "") === String(site._id) || 
        String(f.targetName || "").trim().toLowerCase() === String(site.name || "").trim().toLowerCase()
      );
      
      const reviewCount = siteFeedbacks.length;
      const averageRating = reviewCount > 0
        ? siteFeedbacks.reduce((sum, f) => sum + f.rating, 0) / reviewCount
        : 0;

      return {
        ...site,
        averageRating,
        reviewCount
      };
    });
    console.log('Success! Processed data.');
    process.exit(0);
  } catch (err) {
    console.error('CRASH:', err);
    process.exit(1);
  }
}

debugGetAll();
