const CustomerNotification = require('../../models/customer-notification-model/customerNotificationModel');

// Fetch notifications for a specific user by email
exports.getNotificationsByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const notifications = await CustomerNotification.find({ 
      customerEmail: email.toLowerCase().trim() 
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark a specific notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await CustomerNotification.findByIdAndUpdate(
      id, 
      { read: true }, 
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark as alert sent (so user doesn't get duplicate popups)
exports.markAlertSent = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await CustomerNotification.findByIdAndUpdate(
      id, 
      { alertSent: true }, 
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
