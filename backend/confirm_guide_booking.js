const mongoose = require('mongoose');
require('dotenv').config();
const GuideBooking = require('./src/models/guide-booking-model/guideBookingModel');

async function confirmGuideBooking() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Find a pending guide booking and confirm it
    const booking = await GuideBooking.findOne({ status: 'Pending' });
    if (booking) {
      booking.status = 'Confirmed';
      await booking.save();
      console.log(`Confirmed booking ${booking._id} for guide ${booking.guideName}`);
    } else {
      console.log('No pending guide bookings found.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

confirmGuideBooking();
