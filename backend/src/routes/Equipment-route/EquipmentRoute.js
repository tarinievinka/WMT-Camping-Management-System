const express = require('express');
const router = express.Router();
const equipmentController = require('../../controllers/Equipment-controller/EquipmentController');
const upload     = require('../../config/upload'); 
const { protect } = require('../../middleware/authMiddleware');

// Create — now accepts multipart/form-data with optional image
router.post('/add', upload.single('image'), equipmentController.createEquipment);

// Get all equipment
router.get('/', equipmentController.getAllEquipment);
router.get('/display', equipmentController.getAllEquipment);

// Get equipment by ID
router.get('/:id', equipmentController.getEquipmentById);

// Update — also accepts optional new image
router.put('/update/:id', upload.single('image'), equipmentController.updateEquipment);

// Delete equipment by ID
router.delete('/delete/:id', equipmentController.deleteEquipment);

// Update availability status
router.patch('/:id/status', equipmentController.updateAvailabilityStatus);

router.patch('/reduce-stock/:id', protect, equipmentController.reduceStock);

module.exports = router;