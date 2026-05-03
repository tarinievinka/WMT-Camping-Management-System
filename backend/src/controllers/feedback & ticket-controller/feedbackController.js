const feedbackService = require('../../services/feedback & ticket-service/feedbackService');
const {
  isValidRating,
  isValidTargetType,
  generateEditableTime,
  sanitizeComment
} = require('../../utils/feedbackUtils');
const Reservation = require('../../models/reservation-models/Reservation');
const GuideBooking = require('../../models/guide-booking-model/guideBookingModel');
const EquipmentPurchase = require('../../models/Equipment-model/EquipmentPurchase');
const Campsite = require('../../models/campsite-model/CampsiteModel');
const Equipment = require('../../models/Equipment-model/EquipmentModel');
const Guide = require('../../models/guide-model/guidemodel');
const Feedback = require('../../models/feedback & ticket-model/FeedbackModel');

// Create
exports.createFeedback = async (req, res) => {
  try {
    console.log('[DEBUG] Create Feedback Request Body:', req.body);
    console.log('[DEBUG] Create Feedback Files:', req.files);
    const { targetType, comment } = req.body;
    const rating = Number(req.body.rating);
    req.body.rating = rating;

    // Use req.user if userId is not in body (from authMiddleware)
    if (!req.body.userId && req.user) {
      req.body.userId = req.user._id || req.user.id;
      if (!req.body.userName) req.body.userName = req.user.name;
    }

    if (!isValidRating(rating))
      return res.status(400).json({ error: "Invalid rating" });

    if (!isValidTargetType(targetType))
      return res.status(400).json({ error: "Invalid target type" });

    req.body.comment = sanitizeComment(comment);
    req.body.editableUntil = generateEditableTime();

    let urls = [];
    if (req.body.existingImageUrls) {
      urls = Array.isArray(req.body.existingImageUrls) ? req.body.existingImageUrls : [req.body.existingImageUrls];
    }
    if (req.files && req.files.length > 0) {
      const uploaded = req.files.map(f => `/uploads/${f.filename}`);
      urls = [...urls, ...uploaded];
    }
    if (urls.length > 0) {
      req.body.imageUrls = urls;
    }

    const feedback = await feedbackService.createFeedback(req.body);
    
    // Update target rating
    await updateTargetRating(req.body.targetId, targetType);
    
    res.status(201).json(feedback);
  } catch (err) {
    console.error('Feedback creation error:', err);
    res.status(400).json({ error: err.message });
  }
};

// Helper function to update ratings
const updateTargetRating = async (targetId, targetType) => {
  if (!targetId || targetId === 'undefined') {
    console.warn(`[updateTargetRating] Missing targetId for ${targetType}`);
    return;
  }

  try {
    const mongoose = require('mongoose');
    let oid;
    try {
      oid = new mongoose.Types.ObjectId(targetId);
    } catch (e) {
      console.error(`[updateTargetRating] Invalid ObjectId: ${targetId}`);
      return;
    }

    const stats = await Feedback.aggregate([
      { $match: { targetId: oid, isVisible: true } },
      {
        $group: {
          _id: "$targetId",
          averageRating: { $avg: "$rating" },
          numReviews: { $sum: 1 }
        }
      }
    ]);

    const averageRating = stats.length > 0 ? stats[0].averageRating : 0;
    const numReviews = stats.length > 0 ? stats[0].numReviews : 0;

    console.log(`[updateTargetRating] Updating ${targetType} ${targetId}: avg=${averageRating}, count=${numReviews}`);

    let Model;
    if (targetType === 'Campsite') Model = Campsite;
    else if (targetType === 'Equipment') Model = Equipment;
    else if (targetType === 'Guide') Model = Guide;

    if (Model) {
      const updated = await Model.findByIdAndUpdate(targetId, { averageRating, numReviews }, { new: true });
      if (!updated) {
        console.error(`[updateTargetRating] Target not found: ${targetType} ${targetId}`);
      } else {
        console.log(`[updateTargetRating] Successfully updated ${targetType} ${targetId}`);
      }
    }
  } catch (error) {
    console.error(`[updateTargetRating] Error updating rating for ${targetType} ${targetId}:`, error);
  }
};

// Get all
exports.getAllFeedbacks = async (req, res) => {
  try {
    const { targetId, targetType, userId } = req.query;
    const filter = {};
    if (targetId) filter.targetId = targetId;
    if (targetType) filter.targetType = targetType;
    if (userId) filter.userId = userId;

    const data = await feedbackService.getAllFeedbacks(filter);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get by ID
exports.getFeedbackById = async (req, res) => {
  try {
    const data = await feedbackService.getFeedbackById(req.params.id);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateFeedback = async (req, res) => {
  try {
    const feedback = await feedbackService.getFeedbackById(req.params.id);
    if (!feedback) return res.status(404).json({ error: "Not found" });

    // Check ownership
    const currentUserId = req.user.id || req.user._id;
    if (feedback.userId.toString() !== currentUserId.toString()) {
      return res.status(403).json({ error: "Unauthorized to update this feedback" });
    }

    let urls = [];
    if (req.body.existingImageUrls) {
      urls = Array.isArray(req.body.existingImageUrls) ? req.body.existingImageUrls : [req.body.existingImageUrls];
    }
    if (req.files && req.files.length > 0) {
      const uploaded = req.files.map(f => `/uploads/${f.filename}`);
      urls = [...urls, ...uploaded];
    }
    // Only update imageUrls if there were any provided, else do not overwrite
    if (urls.length > 0 || req.body.clearImages === 'true') {
      req.body.imageUrls = urls;
    }

    const data = await feedbackService.updateFeedback(req.params.id, req.body);
    
    // Update target rating
    await updateTargetRating(feedback.targetId, feedback.targetType);
    
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await feedbackService.getFeedbackById(req.params.id);
    if (!feedback) return res.status(404).json({ error: "Not found" });

    // Check ownership
    const currentUserId = req.user.id || req.user._id;
    if (feedback.userId.toString() !== currentUserId.toString()) {
      return res.status(403).json({ error: "Unauthorized to delete this feedback" });
    }

    await feedbackService.deleteFeedback(req.params.id);
    
    // Update target rating
    await updateTargetRating(feedback.targetId, feedback.targetType);
    
    res.json({ message: "Feedback deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Average rating
exports.getAverageRating = async (req, res) => {
  try {
    const data = await feedbackService.getAverageRating();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Top rated
exports.getTopRated = async (req, res) => {
  try {
    const data = await feedbackService.getTopRated();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Check eligibility
exports.checkEligibility = async (req, res) => {
  try {
    const { targetId, targetType, userId } = req.query;
    if (!targetId || !targetType || !userId) {
      return res.status(400).json({ eligible: false, message: "Missing parameters" });
    }

    let booked = false;

    if (targetType === 'Campsite') {
      const reservation = await Reservation.findOne({
        user: userId,
        campsite: targetId,
        status: { $in: ['confirmed', 'Confirmed', 'Payment Confirmed', 'paid', 'Completed', 'completed'] }
      });
      booked = !!reservation;
    } else if (targetType === 'Guide') {
      const booking = await GuideBooking.findOne({
        userId: userId,
        guideId: targetId,
        status: { $in: ['Confirmed', 'Completed', 'completed', 'Payment Confirmed', 'paid'] }
      });
      booked = !!booking;
    } else if (targetType === 'Equipment') {
      const purchase = await EquipmentPurchase.findOne({
        userId: userId,
        'items.equipmentId': targetId,
        status: { $in: ['paid', 'shipped', 'delivered', 'Completed', 'completed'] }
      });
      booked = !!purchase;
    }

    res.json({ eligible: booked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};