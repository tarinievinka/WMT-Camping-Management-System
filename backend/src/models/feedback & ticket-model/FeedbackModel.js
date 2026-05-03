const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  userName: {
    type: String
  },

  targetType: {
    type: String,
    enum: ["Campsite", "Equipment", "Guide", "General"],
    required: true
  },

  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    refPath: "targetType"
  },

  targetName: {
    type: String
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  title: {
    type: String
  },

  comment: {
    type: String
  },

  isVisible: {
    type: Boolean,
    default: true
  },

  editableUntil: {
    type: Date
  },

  sessionDate: {
    type: Date,
    required: false
  },

  sessionEndDate: {
    type: Date
  },

  imageUrls: {
    type: [String],
    default: []
  }

}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);