const Guide = require("../../models/guide-model/guidemodel");

// Create guide
const createGuide = async (data) => {
  const guide = new Guide(data);
  return await guide.save();
};

// Get all guides
const getAllGuides = async () => {
  const guides = await Guide.find().lean();
  
  // Aggregate feedback to get average rating per guide
  const Feedback = require('../../models/feedback-model/FeedbackModel');
  const feedbacks = await Feedback.find({ targetType: 'Guide' }).lean();
  
  return guides.map(guide => {
    // Match by targetId OR targetName
    const guideFeedbacks = feedbacks.filter(f => {
      const idMatch = f.targetId && f.targetId.toString() === guide._id.toString();
      const nameMatch = f.targetName && f.targetName.trim().toLowerCase() === guide.name.trim().toLowerCase();
      return idMatch || nameMatch;
    });
    
    const reviewCount = guideFeedbacks.length;
    const averageRating = reviewCount > 0 
      ? guideFeedbacks.reduce((sum, f) => sum + f.rating, 0) / reviewCount 
      : 0;

    return {
      ...guide,
      averageRating,
      reviewCount
    };
  });
};

// Get guide by ID
const getGuideById = async (id) => {
  return await Guide.findById(id);
};

// Update guide
const updateGuide = async (id, data) => {
  return await Guide.findByIdAndUpdate(id, data, { new: true });
};

// Delete guide
const deleteGuide = async (id) => {
  return await Guide.findByIdAndDelete(id);
};

// Update guide availability (extra useful for camping system)
const updateGuideAvailability = async (id, availability) => {
  const guide = await Guide.findById(id);
  if (!guide) return null;

  guide.availability = availability;
  await guide.save();

  return guide;
};

module.exports = {
  createGuide,
  getAllGuides,
  getGuideById,
  updateGuide,
  deleteGuide,
  updateGuideAvailability
};