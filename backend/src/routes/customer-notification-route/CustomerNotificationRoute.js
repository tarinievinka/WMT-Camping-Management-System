const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/customer-notification-controller/CustomerNotificationController');

// Get all notifications for a user
router.get('/user/:email', ctrl.getNotificationsByEmail);

// Mark as read
router.patch('/read/:id', ctrl.markAsRead);

// Mark alert as sent
router.patch('/alert-sent/:id', ctrl.markAlertSent);

module.exports = router;
