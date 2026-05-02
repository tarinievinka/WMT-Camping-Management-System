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
<<<<<<< HEAD
            enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
=======
            enum: ["Confirmed", "Pending", "Cancelled", "completed", "pending", "Payment Confirmed", "paid"],
>>>>>>> f2ca66c5d095caae7da6519b6f3697a2aa8ded8d
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
