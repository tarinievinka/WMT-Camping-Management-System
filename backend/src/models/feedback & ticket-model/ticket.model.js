const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  status: {
    type: String,
    enum: ['pending', 'open', 'in-progress', 'approved', 'rejected', 'closed'],
    default: 'pending'
  },
  adminReply: {
    type: String,
    default: ''
  },

  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  images: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const feedbackSchema = new mongoose.Schema({
  targetName: {
    type: String,
    required: [true, 'Please add a target name']
  },
  targetType: {
    type: String,
    enum: ['Campsite', 'Equipment', 'Guide'],
    required: [true, 'Please add a target type']
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment']
  },
  images: [{
    type: String
  }],
  sessionDate: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


const Ticket = mongoose.model('Ticket', ticketSchema);
const Feedback = mongoose.model('SupportFeedback', feedbackSchema);

module.exports = { Ticket, Feedback };
