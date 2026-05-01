const express = require('express');
const router = express.Router();
const ticketController = require('../../controllers/ticket-controller/ticketController');
const { protect, adminOnly } = require('../../middleware/authMiddleware');

// User routes
router.post('/add', protect, ticketController.createTicket);
router.get('/my', protect, ticketController.getMyTickets);

// Admin routes
router.get('/all', protect, adminOnly, ticketController.getAllTickets);
router.patch('/:id/status', protect, adminOnly, ticketController.updateTicketStatus);
router.delete('/:id', protect, adminOnly, ticketController.deleteTicket);

module.exports = router;
