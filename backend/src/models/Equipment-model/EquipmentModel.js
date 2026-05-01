const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema({

  name: {
    type: String,
    required: [true, "Equipment name is required"],
    trim: true,
    minlength: [3,   "Name must be at least 3 characters"],
    maxlength: [100, "Name cannot exceed 100 characters"],
  },

  category: {
    type: String,
    required: [true, "Category is required"],
    enum: {
      values:  ["Tents", "Sleeping Bags", "Backpacks", "Cooking Gear", "Lighting", "Other"],
      message: "{VALUE} is not a valid category",
    },
  },

  condition: {
    type: String,
    required: [true, "Condition is required"],
    enum: {
      values:  ["New", "Good", "Fair", "Poor"],
      message: "{VALUE} is not a valid condition",
    },
  },

  rentalPrice: {
    type: Number,
    required: [true, "Rental price is required"],
    min: [1, "Rental price must be greater than 0"],
  },

  salePrice: {
    type: Number,
    required: [true, "Sale price is required"],
    min: [1, "Sale price must be greater than 0"],
  },

  stockQuantity: {
    type: Number,
    required: [true, "Stock quantity is required"],
    min: [0, "Stock quantity cannot be negative"],
  },

  availabilityStatus: {
    type: String,
    enum: {
      values:  ["Available", "Rented", "Out of Stock", "Deactivated"],
      message: "{VALUE} is not a valid availability status",
    },
    default: "Available",
  },

  imageUrl: {
    type: String,
    default: "",
  },

  description: {
    type: String,
    trim: true,
    maxlength: [1000, "Description cannot exceed 1000 characters"],
  },

}, { timestamps: true });

module.exports = mongoose.model("Equipment", equipmentSchema);