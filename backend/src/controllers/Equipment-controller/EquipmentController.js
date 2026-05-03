const mongoose = require('mongoose');
const {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment: serviceDeleteEquipment,
  updateAvailabilityStatus,
  reduceStock,
} = require('../../services/Equipment-service/EquipmentService');

// ── Helper: validate MongoDB ObjectId ───────────────────────
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a new equipment item
exports.createEquipment = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;
    } else if (data.images && data.images.length > 0) {
      data.imageUrl = data.images[0];
    }
    const equipment = await createEquipment(data);
    res.status(201).json({ success: true, data: equipment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all equipment
exports.getAllEquipment = async (req, res) => {
  try {
    const equipment = await getAllEquipment();
    res.json({ success: true, data: equipment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get equipment by ID
exports.getEquipmentById = async (req, res) => {
  if (!isValidId(req.params.id))
    return res.status(400).json({ error: 'Invalid equipment ID' });
  try {
    const equipment = await getEquipmentById(req.params.id);
    if (!equipment) return res.status(404).json({ error: 'Equipment not found' });
    res.json({ success: true, data: equipment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update equipment by ID
exports.updateEquipment = async (req, res) => {
  if (!isValidId(req.params.id))
    return res.status(400).json({ error: 'Invalid equipment ID' });
  try {
    const data = { ...req.body };
    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;
    }
    const equipment = await updateEquipment(req.params.id, data);
    if (!equipment) return res.status(404).json({ error: 'Equipment not found' });
    res.json(equipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete equipment by ID
exports.deleteEquipment = async (req, res) => {
  if (!isValidId(req.params.id))
    return res.status(400).json({ error: 'Invalid equipment ID' });
  try {
    const equipment = await serviceDeleteEquipment(req.params.id);
    if (!equipment) return res.status(404).json({ error: 'Equipment not found' });
    res.json({ message: 'Equipment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update availability status
exports.updateAvailabilityStatus = async (req, res) => {
  if (!isValidId(req.params.id))
    return res.status(400).json({ error: 'Invalid equipment ID' });
  try {
    const { status } = req.body;
    const equipment = await updateAvailabilityStatus(req.params.id, status);
    if (!equipment) return res.status(404).json({ error: 'Equipment not found' });
    res.json(equipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Reduce stock when user confirms a booking
exports.reduceStock = async (req, res) => {
  if (!isValidId(req.params.id))
    return res.status(400).json({ error: 'Invalid equipment ID' });
  try {
    const { quantity, mode } = req.body;
    const equipment = await reduceStock(req.params.id, quantity, mode);
    if (!equipment) return res.status(404).json({ error: 'Equipment not found' });
    res.json(equipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};