const express = require("express");
const router = express.Router();
const guideBookingController = require("../../controllers/guide-booking-controller/guideBookingController");
const { protect } = require("../../middleware/authMiddleware");

// Create booking
router.post("/add", protect, guideBookingController.createBooking);

// Get all bookings
router.get("/display", guideBookingController.getAllBookings);

// Get bookings for a specific guide
router.get("/guide/:guideId", guideBookingController.getBookingsByGuide);

// Customer notifications (after guide confirms booking, etc.)
router.get("/notifications", guideBookingController.getCustomerNotifications);
router.patch("/notifications/:id/read", guideBookingController.markCustomerNotificationRead);

// Update a booking by ID
router.put("/update/:id", guideBookingController.updateBooking);

// Delete booking by ID
router.delete("/cancel/:id", guideBookingController.deleteBookingById);

module.exports = router;
