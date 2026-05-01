const mongoose = require('mongoose');

const notifySchema = new mongoose.Schema({
  email:     { type: String, required: true },
  itemId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  itemName:  { type: String, required: true },
  category:  { type: String },
  notified:  { type: Boolean, default: false },  // admin can mark as "notified"
}, { timestamps: true });

module.exports = mongoose.model('Notify', notifySchema);