const ticketService = require('./ticket.service');

// @desc    Create new ticket
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
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getMyTickets(req.user.id);
    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all tickets
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getAllTickets();
    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update ticket
exports.updateTicket = async (req, res) => {
  try {
    const ticket = await ticketService.updateTicket(req.params.id, req.body);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }
    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete ticket
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await ticketService.deleteTicket(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create feedback
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
exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await ticketService.getAllFeedback();
    res.status(200).json({ success: true, count: feedback.length, data: feedback });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
