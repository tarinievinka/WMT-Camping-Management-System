const mongoose = require("mongoose");

const guideSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Guide name is Required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is Required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid Email address"],
    },

    phone: {
      type: String,
      required: false,
      trim: true,
    },

    experience: {
      type: Number,
      required: false,
      min: [0, "Experience cannot be negative"],
    },

    nic: {
      type: String,
      required: [true, "NIC is Required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [18, "Age must be at least 18"],
    },
    language: {
      type: String,
      trim: true,
    },
    cv: {
      type: String,
      trim: true,
    },

    availability: {
      type: Boolean,
      default: true,
    },

    description: {
      type: String,
      trim: true,
    },

    coverPhoto: { type: String, default: "" },
    profilePhoto: { type: String, default: "" },
    specialties: { type: [String], default: [] },
    gear: {
      type: [{ name: String, checked: Boolean }],
      default: []
    },
    gallery: { type: [String], default: [] },
    /** Highlights for public profile (e.g. "Yala safari 2024") */
    pastTours: {
      type: [{ title: { type: String, trim: true }, summary: { type: String, trim: true } }],
      default: [],
    },
    /** Extra skills beyond specialty tags (first aid, navigation, etc.) */
    skills: { type: [String], default: [] },
    dailyRate: { type: Number },
    isPaused: { type: Boolean, default: false },
    /** Optional: when guide expects to accept bookings again (shown when paused + admin unavailable) */
    availableAgainAt: { type: Date, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true, // creates createdAt & updatedAt automatically
  }
);


module.exports = mongoose.model("Guide", guideSchema);
