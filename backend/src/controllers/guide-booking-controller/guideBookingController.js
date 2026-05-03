const GuideBooking = require("../../models/guide-booking-model/guideBookingModel");
const Guide = require("../../models/guide-model/guidemodel");
const CustomerNotification = require("../../models/customer-notification-model/customerNotificationModel");
const User = require("../../models/user-models/User");

function escapeRegex(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        if (req.body.guideId) {
            const g = await Guide.findById(req.body.guideId);
            if (!g) {
                return res.status(404).json({ error: "Guide not found" });
            }
            if (g.availability === false && g.isPaused === true) {
                return res.status(403).json({
                    error: "This guide is not accepting bookings right now.",
                });
            }
        }
        const booking = new GuideBooking(req.body);
        await booking.save();
        res.status(201).json(booking);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await GuideBooking.find().populate("guideId");
        const results = bookings.map(b => {
            const doc = b.toObject();
            if (doc.guideId && typeof doc.guideId === 'object' && !doc.guideName) {
                doc.guideName = doc.guideId.name;
            }
            return doc;
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get bookings for a specific guide
exports.getBookingsByGuide = async (req, res) => {
    try {
        const { guideId } = req.params;
        const bookings = await GuideBooking.find({ guideId }).populate("guideId");
        const results = bookings.map(b => {
            const doc = b.toObject();
            if (doc.guideId && typeof doc.guideId === 'object' && !doc.guideName) {
                doc.guideName = doc.guideId.name;
            }
            return doc;
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get bookings for the currently logged-in guide
exports.getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const guide = await Guide.findOne({ userId });
        if (!guide) {
            return res.status(404).json({ error: "Guide profile not found for this user" });
        }
        const bookings = await GuideBooking.find({ guideId: guide._id }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get bookings for the currently logged-in customer (camper)
exports.getCustomerBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const bookings = await GuideBooking.find({ userId }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a booking by ID
exports.updateBooking = async (req, res) => {
    try {
        const id = req.params.id;
        const existing = await GuideBooking.findById(id);
        if (!existing) {
            return res.status(404).json({ message: "Booking not found" });
        }
        const prevStatus = String(existing.status || "").toLowerCase();
        const updated = await GuideBooking.findByIdAndUpdate(id, req.body, { new: true });
        const newStatus = String(updated.status || "").toLowerCase();

        console.log(`[GUIDE_BOOKING] Status change: ${prevStatus} -> ${newStatus} for booking ${id}`);

        if (prevStatus !== newStatus) {
            try {
                // Find the user to get their email
                let user = null;
                if (updated.userId) {
                    user = await User.findById(updated.userId);
                }

                if (user) {
                    let title = "Booking Update";
                    let body = `Your booking status for ${updated.guideName || 'your guide'} has changed to ${updated.status}.`;
                    
                    if (newStatus === "confirmed" || newStatus === "payment confirmed" || newStatus === "paid") {
                        title = "Booking Confirmed! ✅";
                        body = `Great news! Your booking with guide ${updated.guideName || ''} has been confirmed.`;
                    } else if (newStatus === "cancelled" || newStatus === "failed" || newStatus === "rejected") {
                        title = "Booking Rejected/Cancelled ❌";
                        body = `Your booking request for guide ${updated.guideName || ''} was not successful.`;
                    } else if (newStatus === "completed") {
                        title = "Trip Completed! 🏔️";
                        body = `Hope you had a great trip with ${updated.guideName || ''}! Please leave a review.`;
                    }

                    console.log(`[NOTIFY] Creating notification for ${user.email}: ${title}`);

                    await CustomerNotification.create({
                        customerName: user.username || user.name || updated.customerName || "Valued Camper",
                        customerEmail: user.email,
                        bookingId: updated._id,
                        title: title,
                        body: body,
                        read: false,
                    });
                } else {
                    console.warn(`[NOTIFY] User not found for userId: ${updated.userId}. Cannot send notification.`);
                }
            } catch (e) {
                console.error("[NOTIFY_ERROR] Customer notification create failed:", e.message);
            }
        }
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a booking by ID (for cancelling)
exports.deleteBookingById = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await GuideBooking.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.json({ message: "Booking cancelled successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/** In-app notifications for customers (match name used when booking) */
exports.getCustomerNotifications = async (req, res) => {
    try {
        const name = String(req.query.customerName || "").trim();
        if (!name) {
            return res.status(400).json({ error: "customerName query is required" });
        }
        const safe = escapeRegex(name);
        const list = await CustomerNotification.find({
            customerName: new RegExp(`^${safe}$`, "i"),
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.markCustomerNotificationRead = async (req, res) => {
    try {
        const n = await CustomerNotification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        if (!n) {
            return res.status(404).json({ message: "Notification not found" });
        }
        res.json(n);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
