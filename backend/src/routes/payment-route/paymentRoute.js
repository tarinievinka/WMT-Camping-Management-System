const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/payment-controller/paymentController');
const upload = require('../../config/upload');

// Create a new Payment
router.post('/add', upload.single('receipt'), paymentController.createPayment);

// Get all Payments
router.get('/display', paymentController.getAllPayments);

// Get a Payment by ID
router.get('/:id', paymentController.getPaymentById);

// Update a Payment by ID
router.put('/update/:id', paymentController.updatePayment);

// Delete a Payment by ID
router.delete('/delete/:id', paymentController.deletePayment);

// Update payment status
router.patch('/:id/status', paymentController.updatePaymentStatus);

module.exports = router;
