const { Ticket, Feedback } = require('../../models/feedback & ticket-model/ticket.model');

const createTicket = async (ticketData) => {
  return await Ticket.create(ticketData);
};

const getMyTickets = async (userId) => {
  return await Ticket.find({ createdBy: userId }).sort('-createdAt');
};

const getAllTickets = async () => {
  return await Ticket.find().populate('createdBy', 'name email').sort('-createdAt');
};

const updateTicket = async (id, updateData) => {
  return await Ticket.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });
};

const deleteTicket = async (id) => {
  return await Ticket.findByIdAndDelete(id);
};

const createFeedback = async (feedbackData) => {
  return await Feedback.create(feedbackData);
};

const getAllFeedback = async () => {
  return await Feedback.find().populate('userId', 'name email').sort('-createdAt');
};

module.exports = {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicket,
  deleteTicket,
  createFeedback,
  getAllFeedback
};
