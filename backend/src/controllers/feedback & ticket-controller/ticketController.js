const ticketService = require('../../services/feedback & ticket-service/ticket.service');
const { Ticket, Feedback } = require('../../models/feedback & ticket-model/ticket.model');

// @desc    Create new ticket
// @route   POST /api/tickets/create
// @access  Private (User)
exports.createTicket = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    const ticket = await ticketService.createTicket(req.body);
    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get user tickets
// @route   GET /api/tickets/my-tickets
// @access  Private (User)
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getMyTickets(req.user.id);
    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all tickets
// @route   GET /api/tickets/all
// @access  Private (Admin)
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getAllTickets();
    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update ticket
// @route   PUT /api/tickets/update/:id
// @access  Private (Admin)
exports.updateTicket = async (req, res) => {
  try {
    let ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    if (ticket.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this ticket' });
    }

    ticket = await ticketService.updateTicket(req.params.id, req.body);
    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Admin reply to ticket
// @route   PUT /api/tickets/admin/reply/:id
// @access  Private (Admin)
exports.adminReplyTicket = async (req, res) => {
  try {
    const { status, adminReply } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status, adminReply },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/delete/:id
// @access  Private (Admin)
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    if (ticket.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this ticket' });
    }

    await ticketService.deleteTicket(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create feedback
// @route   POST /api/feedback/create
// @access  Private (User)
exports.createFeedback = async (req, res) => {
  try {
    req.body.userId = req.user.id;
    const feedback = await ticketService.createFeedback(req.body);
    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all feedback
// @route   GET /api/feedback/all
// @access  Private (Admin)
exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await ticketService.getAllFeedback();
    res.status(200).json({ success: true, count: feedback.length, data: feedback });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get user feedback
// @route   GET /api/feedback/my-feedback
// @access  Private (User)
exports.getMyFeedback = async (req, res) => {
  try {
    const feedback = await ticketService.getMyFeedback(req.user.id);
    res.status(200).json({ success: true, count: feedback.length, data: feedback });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update feedback
// @route   PUT /api/feedback/update/:id
// @access  Private (User)
exports.updateFeedback = async (req, res) => {
  try {
    let feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, error: 'Feedback not found' });
    }

    if (feedback.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    feedback = await ticketService.updateFeedback(req.params.id, req.body);
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/delete/:id
// @access  Private (User)
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, error: 'Feedback not found' });
    }

    if (feedback.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await ticketService.deleteFeedback(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
