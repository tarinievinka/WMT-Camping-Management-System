const express = require('express');
const router = express.Router();
const {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicket,
  deleteTicket,
  createFeedback,
  getAllFeedback
} = require('../../modules/ticket/ticket.controller');
const { protect, adminOnly } = require('../../middleware/authMiddleware');

// Ticket Routes
router.post('/tickets/create', protect, createTicket);
router.get('/tickets/my-tickets', protect, getMyTickets);
router.get('/tickets/all', protect, adminOnly, getAllTickets);
router.put('/tickets/update/:id', protect, adminOnly, updateTicket);
router.delete('/tickets/delete/:id', protect, adminOnly, deleteTicket);

// Feedback Routes
router.post('/feedback/create', protect, createFeedback);
router.get('/feedback/all', protect, adminOnly, getAllFeedback);

module.exports = router;
