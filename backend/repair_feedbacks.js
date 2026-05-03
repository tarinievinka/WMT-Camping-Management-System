const mongoose = require('mongoose');
require('dotenv').config();
const Feedback = require('./src/models/feedback & ticket-model/FeedbackModel');
const Campsite = require('./src/models/campsite-model/CampsiteModel');
const Equipment = require('./src/models/Equipment-model/EquipmentModel');
const Guide = require('./src/models/guide-model/guidemodel');

async function repairFeedbacks() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const feedbacks = await Feedback.find({ targetId: { $exists: false } });
    console.log(`Found ${feedbacks.length} feedbacks missing targetId`);
    
    for (const f of feedbacks) {
      let Model;
      if (f.targetType === 'Campsite') Model = Campsite;
      else if (f.targetType === 'Equipment') Model = Equipment;
      else if (f.targetType === 'Guide') Model = Guide;
      
      if (Model && f.targetName) {
        const target = await Model.findOne({ name: f.targetName });
        if (target) {
          f.targetId = target._id;
          await f.save();
          console.log(`Repaired feedback ${f._id} for ${f.targetName}`);
        } else {
          console.warn(`Could not find target for ${f.targetName} (${f.targetType})`);
        }
      }
    }
    
    console.log('Repair complete. Triggering rating updates...');
    
    // Trigger updates for all targets
    const campsites = await Campsite.find();
    for (const c of campsites) {
       await updateRating(c._id, 'Campsite', Campsite);
    }
    const equipments = await Equipment.find();
    for (const e of equipments) {
       await updateRating(e._id, 'Equipment', Equipment);
    }
    const guides = await Guide.find();
    for (const g of guides) {
       await updateRating(g._id, 'Guide', Guide);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

async function updateRating(targetId, targetType, Model) {
    const stats = await Feedback.aggregate([
      { $match: { targetId: targetId, isVisible: true } },
      {
        $group: {
          _id: "$targetId",
          averageRating: { $avg: "$rating" },
          numReviews: { $sum: 1 }
        }
      }
    ]);

    const averageRating = stats.length > 0 ? stats[0].averageRating : 0;
    const numReviews = stats.length > 0 ? stats[0].numReviews : 0;
    
    await Model.findByIdAndUpdate(targetId, { averageRating, numReviews });
    console.log(`Updated ${targetType} ${targetId}: ${averageRating} (${numReviews})`);
}

repairFeedbacks();
