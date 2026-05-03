const mongoose = require('mongoose');
require('dotenv').config();
const GuideBooking = require('./src/models/guide-booking-model/guideBookingModel');

async function checkGuideBookings() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const bookings = await GuideBooking.find();
    console.log('Guide Bookings:');
    bookings.forEach(b => {
      console.log(`ID: ${b._id}, GuideName: ${b.guideName}, GuideID: ${b.guideId}, Status: ${b.status}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkGuideBookings();
