const mongoose = require('mongoose');
const ticketService = require('../../services/feedback & ticket-service/ticket.service');
const { Ticket, Feedback } = require('../../models/feedback & ticket-model/ticket.model');

const asUserIdString = (user) => {
  const raw = user?.id ?? user?._id;
  if (raw == null) return '';
  return String(raw);
};

const ownerIdString = (ticket) => {
  if (!ticket?.createdBy) return '';
  if (typeof ticket.createdBy === 'object' && ticket.createdBy.toString) {
    return ticket.createdBy.toString();
  }
  return String(ticket.createdBy);
};

// @desc    Create new ticket
// @route   POST /api/tickets/create
// @access  Private (User)
exports.createTicket = async (req, res) => {
  try {
    req.body.createdBy = asUserIdString(req.user);
    
    // Clean up req.body.images if it's not an array
    if (req.body.images && !Array.isArray(req.body.images)) {
      delete req.body.images;
    }

    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => `/uploads/${file.filename}`);
    }

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
    const tickets = await ticketService.getMyTickets(asUserIdString(req.user));
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
    console.log(`[BACKEND] Update Ticket Request for ID: ${req.params.id}`);
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid ticket id' });
    }
    let ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    const requesterId = asUserIdString(req.user);
    if (ownerIdString(ticket) !== requesterId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this ticket' });
    }

    // Clean up req.body.images if it's not an array
    if (req.body.images && !Array.isArray(req.body.images)) {
      delete req.body.images;
    }

    // Handle images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      req.body.images = [...(ticket.images || []), ...newImages];
    }

    ticket = await ticketService.updateTicket(req.params.id, req.body);
    console.log(`[BACKEND] Ticket ${req.params.id} updated successfully`);
    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    console.error('[BACKEND] Ticket Update Error:', error.message);
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
    console.log(`[BACKEND] Delete request for ticket ID: ${req.params.id}`);
    console.log(`[BACKEND] Request by User ID: ${asUserIdString(req.user)} (Role: ${req.user?.role})`);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid ticket id' });
    }
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    const requesterId = asUserIdString(req.user);
    const ownerId = ownerIdString(ticket);
    console.log(`[BACKEND] Ticket Owner ID: ${ownerId}, Requester ID: ${requesterId}`);

    if (ownerId !== requesterId && req.user.role !== 'admin') {
      console.log(`[BACKEND] Authorization Failed: User ${requesterId} is not owner ${ownerId} and not admin`);
      return res.status(403).json({ success: false, error: 'Not authorized to delete this ticket' });
    }

    console.log(`[BACKEND] Authorization Success. Deleting...`);
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
    console.log('[BACKEND] Create Feedback Request');
    console.log('[BACKEND] Files:', req.files?.length || 0);
    console.log('[BACKEND] Body:', JSON.stringify(req.body, null, 2));

    req.body.userId = asUserIdString(req.user);
    
    // Clean up req.body.images if it's not an array (prevents validation errors)
    if (req.body.images && !Array.isArray(req.body.images)) {
      delete req.body.images;
    }

    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const feedback = await ticketService.createFeedback(req.body);
    console.log('[BACKEND] Feedback Created Successfully:', feedback._id);
    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    console.error('[BACKEND] Feedback Creation Error:', error.message);
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
    const feedback = await ticketService.getMyFeedback(asUserIdString(req.user));
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
    console.log(`[BACKEND] Update Feedback Request for ID: ${req.params.id}`);
    let feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, error: 'Feedback not found' });
    }

    if (feedback.userId.toString() !== asUserIdString(req.user) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Clean up req.body.images if it's not an array
    if (req.body.images && !Array.isArray(req.body.images)) {
      delete req.body.images;
    }

    // Handle images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      // If the frontend sends existing images, we should merge them
      // But for now, let's just append or replace based on how we want it
      // Let's assume we replace or append
      req.body.images = [...(feedback.images || []), ...newImages];
    }

    feedback = await ticketService.updateFeedback(req.params.id, req.body);
    console.log(`[BACKEND] Feedback ${req.params.id} updated successfully`);
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    console.error('[BACKEND] Feedback Update Error:', error.message);
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

    if (feedback.userId.toString() !== asUserIdString(req.user) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await ticketService.deleteFeedback(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
