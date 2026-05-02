const paymentService = require('../../services/payment-service/paymentService');

// Create a new payment
exports.createPayment = async (req, res) => {
  try {
    const paymentData = { ...req.body };
    console.log('[PAYMENT DATA RECEIVED]', paymentData);
    if (req.file) {
      paymentData.receiptUrl = `/uploads/${req.file.filename}`;
    }
    const payment = await paymentService.createPayment(paymentData);
    res.status(201).json(payment);
  } catch (err) {
    console.error('[PAYMENT_CONTROLLER_ERROR]', err);
    res.status(400).json({ error: err.message });
  }
};

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await paymentService.getAllPayments();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get payments for logged-in user
exports.getMyPayments = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    console.log(`[PAYMENT_DEBUG] Fetching payments for user: ${userId}`);
    const payments = await paymentService.getPaymentsByUser(userId);
    console.log(`[PAYMENT_DEBUG] Found ${payments.length} payments`);
    res.json(payments);
  } catch (err) {
    console.error(`[PAYMENT_DEBUG] Error fetching payments for ${req.user?._id}:`, err);
    res.status(500).json({ error: err.message });
  }
};

// Get a payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a payment by ID
exports.updatePayment = async (req, res) => {
  try {
    const payment = await paymentService.updatePayment(req.params.id, req.body);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a payment by ID
exports.deletePayment = async (req, res) => {
  console.log(`[PAYMENT_CONTROLLER] Deletion requested for ID: ${req.params.id}`);
  try {
    const payment = await paymentService.deletePayment(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update payment status (success, failed, pending)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await paymentService.updatePaymentStatus(req.params.id, status);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
