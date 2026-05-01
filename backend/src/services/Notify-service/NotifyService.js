const Notify = require('../../models/Notify-model/NotifyModel');

const addNotifyRequest = async (data) => {
  // Check if same email already registered for same item
  const existing = await Notify.findOne({ email: data.email, itemId: data.itemId, notified: false });
  if (existing) throw new Error('This email is already registered for this item');
  return await new Notify(data).save();
};

const getAllNotifyRequests = async () => {
  return await Notify.find().sort({ createdAt: -1 });
};

const markAsNotified = async (id) => {
  return await Notify.findByIdAndUpdate(id, { notified: true }, { new: true });
};

const deleteNotifyRequest = async (id) => {
  return await Notify.findByIdAndDelete(id);
};

module.exports = { addNotifyRequest, getAllNotifyRequests, markAsNotified, deleteNotifyRequest };