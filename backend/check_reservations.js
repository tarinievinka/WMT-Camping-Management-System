const mongoose = require('mongoose');
require('dotenv').config();
const Reservation = require('./src/models/reservation-models/Reservation.js');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const res = await Reservation.find({ status: { $ne: 'cancelled' } });
  console.log('ACTIVE RESERVATIONS:', JSON.stringify(res, null, 2));
  process.exit(0);
}

check();
