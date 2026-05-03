const express = require('express');
const router = express.Router();
const purchaseController = require('../../controllers/Equipment-controller/purchaseController');
const { protect, adminOnly } = require('../../middleware/authMiddleware');

router.post('/', protect, purchaseController.createPurchase);
router.get('/my', protect, purchaseController.getMyPurchases);

// Admin routes
router.get('/all', protect, adminOnly, purchaseController.getAllPurchases);
router.patch('/:id/status', protect, adminOnly, purchaseController.updatePurchaseStatus);

router.delete('/:id', protect, purchaseController.deletePurchase);

module.exports = router;

