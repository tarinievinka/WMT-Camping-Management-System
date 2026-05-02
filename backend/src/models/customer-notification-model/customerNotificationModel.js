const mongoose = require("mongoose");

const customerNotificationSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true }, // Added for targeting specific user
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "GuideBooking" },
    title: { type: String, required: true, trim: true },
    body: { type: String, default: "", trim: true },
    read: { type: Boolean, default: false },
    restocked: { type: Boolean, default: false }, // Added for restock alerts
    alertSent: { type: Boolean, default: false }, // Added to track browser alerts
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomerNotification", customerNotificationSchema);
