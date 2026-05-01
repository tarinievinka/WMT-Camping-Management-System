const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  bookingType: {
    type: String,
    enum: ["CampsiteBooking", "EquipmentBooking", "GuideBooking"],
    required: true
  },

  bookingId: {
    type: String,
    required: true,
    // Note: refPath still works with Strings in many Mongoose versions for manual lookups
  },

  amount: {
    type: Number,
    required: true
  },

  paymentMethod: {
    type: String,
    enum: ["card", "upi", "cash", "online", "bank-deposit", "google-pay"],
    required: true
  },

  receiptUrl: {
    type: String
  },

  transactionId: {
    type: String
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "success", "failed", "cancelled", "refunded"],
    default: "pending"
  },

  paidAt: {
    type: Date
  }

}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
