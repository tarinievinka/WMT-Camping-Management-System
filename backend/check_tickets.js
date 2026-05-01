const mongoose = require('mongoose');
require('dotenv').config();
const { Ticket } = require('./src/models/feedback & ticket-model/ticket.model');

const checkTickets = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const tickets = await Ticket.find();
    console.log('Tickets found:', tickets.length);
    tickets.forEach(t => {
      console.log(`ID: ${t._id}, Title: ${t.title}, CreatedBy: ${t.createdBy}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkTickets();
