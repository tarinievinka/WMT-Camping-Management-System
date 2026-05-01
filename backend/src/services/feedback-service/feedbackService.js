const Feedback = require('../../models/feedback-model/FeedbackModel');

// Create
const createFeedback = async (data) => {
  const feedback = new Feedback(data);
  return await feedback.save();
};

// Get all
const getAllFeedbacks = async () => {
  return await Feedback.find();
};

// Get by ID
const getFeedbackById = async (id) => {
  return await Feedback.findById(id);
};

// Update
const updateFeedback = async (id, data) => {
  return await Feedback.findByIdAndUpdate(id, data, { new: true });
};

// Delete
const deleteFeedback = async (id) => {
  return await Feedback.findByIdAndDelete(id);
};

// Average rating
const getAverageRating = async () => {
  const result = await Feedback.aggregate([
    { $group: { _id: null, averageRating: { $avg: "$rating" } } }
  ]);
  return result[0] || { averageRating: 0 };
};

// Top rated
const getTopRated = async () => {
  return await Feedback.find().sort({ rating: -1 }).limit(5);
};

module.exports = {
  createFeedback,
  getAllFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  getAverageRating,
  getTopRated
};