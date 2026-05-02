const mongoose = require("mongoose");

const campsiteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Campsite name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    pricePerNight: {
      type: Number,
      required: [true, "Price per night is required"],
      min: [0, "Price cannot be negative"],
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },
    amenities: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: false,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Campsite", campsiteSchema);
