const GuideBooking = require("../../models/guide-booking-model/guideBookingModel");
const Guide = require("../../models/guide-model/guidemodel");
const CustomerNotification = require("../../models/customer-notification-model/customerNotificationModel");

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
        if (prevStatus === "pending" && newStatus === "confirmed") {
            try {
                await CustomerNotification.create({
                    customerName: updated.customerName || "Anonymous",
                    bookingId: updated._id,
                    title: "Booking confirmed",
                    body: "Your guide confirmed your trip request. See details under My Bookings.",
                    read: false,
                });
            } catch (e) {
                console.error("Customer notification create failed:", e.message);
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
