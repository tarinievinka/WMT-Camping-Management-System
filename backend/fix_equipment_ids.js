const mongoose = require('mongoose');
require('dotenv').config();
const Feedback = require('./src/models/feedback & ticket-model/FeedbackModel');
const Equipment = require('./src/models/Equipment-model/EquipmentModel');

async function fixEquipmentIds() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const feedbacks = await Feedback.find({ targetType: 'Equipment' });
    console.log(`Checking ${feedbacks.length} equipment feedbacks...`);
    
    for (const f of feedbacks) {
      // Try to find the correct equipment by name
      const equipment = await Equipment.findOne({ name: f.targetName });
      if (equipment) {
        if (!f.targetId || f.targetId.toString() !== equipment._id.toString()) {
          console.log(`Fixing feedback ${f._id}: ${f.targetId} -> ${equipment._id} (Name: ${f.targetName})`);
          f.targetId = equipment._id;
          await f.save();
        }
      } else {
        console.warn(`Could not find equipment named "${f.targetName}"`);
      }
    }
    
    console.log('\nTriggering rating updates for all equipment...');
    const items = await Equipment.find();
    for (const item of items) {
      const stats = await Feedback.aggregate([
        { $match: { targetId: item._id, isVisible: true } },
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
      
      await Equipment.findByIdAndUpdate(item._id, { averageRating, numReviews });
      console.log(`Updated ${item.name}: ${averageRating} (${numReviews})`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixEquipmentIds();
