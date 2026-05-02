const mongoose = require("mongoose");

const guideBookingSchema = new mongoose.Schema(
    {
        guideId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Guide",
            required: [true, "Guide ID is required"],
        },
        guideName: {
            type: String,
        },
        bookedAt: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
            /** New bookings are requests until the guide confirms */
            default: "Pending",
        },
        customerName: {
            type: String,
        },
        userId: {
            type: String,
        },
        amount: {
            type: Number,
        },
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("GuideBooking", guideBookingSchema);
