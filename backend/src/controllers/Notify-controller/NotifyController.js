const { addNotifyRequest, getAllNotifyRequests, markAsNotified, deleteNotifyRequest } = require('../../services/Notify-service/NotifyService');

exports.addNotifyRequest = async (req, res) => {
  try {
    const result = await addNotifyRequest(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllNotifyRequests = async (req, res) => {
  try {
    const results = await getAllNotifyRequests();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAsNotified = async (req, res) => {
  try {
    const result = await markAsNotified(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNotifyRequest = async (req, res) => {
  try {
    await deleteNotifyRequest(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};