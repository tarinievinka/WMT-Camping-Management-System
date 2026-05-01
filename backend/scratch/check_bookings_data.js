const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/camping_db';

const guideBookingSchema = new mongoose.Schema({
    guideId: mongoose.Schema.Types.Mixed,
    guideName: String,
    customerName: String
}, { strict: false });

const GuideBooking = mongoose.model('GuideBooking', guideBookingSchema);

async function check() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to DB');
        const bookings = await GuideBooking.find().limit(5).lean();
        console.log('Recent bookings:');
        bookings.forEach(b => {
            console.log(`ID: ${b._id}, guideId: ${b.guideId} (type: ${typeof b.guideId}), guideName: ${b.guideName}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
