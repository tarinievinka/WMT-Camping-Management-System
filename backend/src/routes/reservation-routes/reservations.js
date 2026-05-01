const express = require('express');
const Reservation = require('../../models/reservation-models/Reservation.js');
const Campsite = require('../../models/campsite-model/CampsiteModel.js');
const { protect, admin, campsiteOwner } = require('../../utils/auth.js');

const router = express.Router();

// Helper: check date overlap
const hasOverlap = (startA, endA, startB, endB) => {
  return new Date(startA) < new Date(endB) && new Date(endA) > new Date(startB);
};

// @route   GET /api/reservations/campsite/:id/bookeddates
// @access  Public - so the booking calendar can show booked dates
router.get('/campsite/:id/bookeddates', async (req, res) => {
  try {
    const reservations = await Reservation.find({
      campsite: req.params.id,
      status: { $ne: 'cancelled' },
    }).select('checkInDate checkOutDate');
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/reservations/myreservations
// @access  Private
router.get('/myreservations', protect, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('campsite', 'name location pricePerNight image');
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/reservations/owner
// @access  Private/CampsiteOwner
router.get('/owner', protect, campsiteOwner, async (req, res) => {
  try {
    const ownedSites = await Campsite.find({ ownerId: req.user._id }).select('_id');
    const siteIds = ownedSites.map(s => s._id);
    const reservations = await Reservation.find({ campsite: { $in: siteIds }, status: { $ne: 'cancelled' } })
      .populate('user', 'name email phone')

      .populate('campsite', 'name location');
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/reservations
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const reservations = await Reservation.find({})
      .populate('user', 'username email phone')
      .populate('campsite', 'name location');
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/reservations
// @access  Private/User
router.post('/', protect, async (req, res) => {
  try {
    const { campsite: campsiteId, checkInDate, checkOutDate, totalPrice } = req.body;
    if (!campsiteId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Incomplete reservation info' });
    }

    const campsite = await Campsite.findById(campsiteId);
    if (!campsite) return res.status(404).json({ message: 'Campsite not found' });

    // Validate booking duration
    const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / 86400000);
    if (nights < 1) return res.status(400).json({ message: 'Check-out must be after check-in' });

    // Check for duplicate — same user, same campsite, overlapping dates
    const existingByUser = await Reservation.findOne({
      user: req.user._id,
      campsite: campsiteId,
      status: { $ne: 'cancelled' },
    });
    if (existingByUser && hasOverlap(checkInDate, checkOutDate, existingByUser.checkInDate, existingByUser.checkOutDate)) {
      return res.status(400).json({ message: 'You already have a booking for these dates at this campsite.' });
    }

    // Check general availability conflict (another user already booked these dates)
    const conflicting = await Reservation.findOne({
      campsite: campsiteId,
      status: { $ne: 'cancelled' },
    });
    const allForCampsite = await Reservation.find({ campsite: campsiteId, status: { $ne: 'cancelled' } });
    const hasConflict = allForCampsite.some(r =>
      hasOverlap(checkInDate, checkOutDate, r.checkInDate, r.checkOutDate)
    );
    if (hasConflict) {
      return res.status(400).json({ message: 'These dates are already booked at this campsite.' });
    }

    const reservation = await Reservation.create({
      user: req.user._id,
      campsite: campsiteId,
      checkInDate,
      checkOutDate,
      totalPrice,
      status: req.body.status || 'confirmed',
    });
    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/reservations/:id
// @access  Private - own reservation only
router.put('/:id', protect, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    if (String(reservation.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to edit this reservation' });
    }

    const { checkInDate, checkOutDate, status } = req.body;

    if (status) {
      reservation.status = status;
    }

    if (checkInDate && checkOutDate) {
      const campsite = await Campsite.findById(reservation.campsite);
      const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / 86400000);
      if (nights < 1) return res.status(400).json({ message: 'Check-out must be after check-in' });

      // Conflict check excluding this reservation
      const others = await Reservation.find({
        campsite: reservation.campsite,
        status: { $ne: 'cancelled' },
        _id: { $ne: reservation._id },
      });
      const hasConflict = others.some(r => hasOverlap(checkInDate, checkOutDate, r.checkInDate, r.checkOutDate));
      if (hasConflict) return res.status(400).json({ message: 'These dates are already taken.' });

      const pricePerNight = campsite.pricePerNight;
      reservation.checkInDate = checkInDate;
      reservation.checkOutDate = checkOutDate;
      reservation.totalPrice = nights * pricePerNight + 35 + 25;
    }

    const updated = await reservation.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/reservations/:id
// @access  Private - own reservation or admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    const isOwner = String(reservation.user) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not authorized' });
    reservation.status = 'cancelled';
    await reservation.save();
    res.json({ message: 'Reservation cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
