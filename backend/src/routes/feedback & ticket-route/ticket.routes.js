const express = require('express');
const router = express.Router();
const {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicket,
  deleteTicket,
  adminReplyTicket,
  createFeedback,
  getAllFeedback,
  getMyFeedback,
  updateFeedback,
  deleteFeedback
} = require('../../controllers/feedback & ticket-controller/ticketController');

const { protect, adminOnly } = require('../../middleware/authMiddleware');

const upload = require('../../utils/upload');

// Ticket Routes
router.post('/tickets/create', protect, upload.array('files', 5), createTicket);
router.get('/tickets/my-tickets', protect, getMyTickets);
router.get('/tickets/all', protect, adminOnly, getAllTickets);
router.put('/tickets/update/:id', protect, upload.array('files', 5), updateTicket);
router.delete('/tickets/delete/:id', protect, deleteTicket);
router.put('/tickets/admin/reply/:id', protect, adminOnly, adminReplyTicket);



module.exports = router;
