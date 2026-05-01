const Ticket = require('../../models/ticket-model/ticketModel');

// Create Ticket
exports.createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const ticket = new Ticket({
      userId: req.user.id,
      userName: req.user.name || 'Anonymous',
      subject,
      message
    });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get My Tickets
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: Get All Tickets
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: Update Ticket Status
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin: Delete Ticket
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json({ message: 'Ticket deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
