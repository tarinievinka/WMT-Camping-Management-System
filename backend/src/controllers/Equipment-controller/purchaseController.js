const EquipmentPurchase = require('../../models/Equipment-model/EquipmentPurchase');
const Equipment = require('../../models/Equipment-model/EquipmentModel');

// Create purchase
exports.createPurchase = async (req, res) => {
    try {
        const { items, totalPrice, shippingAddress } = req.body;
        
        // Basic stock check
        for (const item of items) {
            const equipment = await Equipment.findById(item.equipmentId);
            if (!equipment) throw new Error(`Equipment ${item.equipmentId} not found`);
            if (equipment.quantity < item.quantity) {
                throw new Error(`Insufficient stock for ${equipment.name}`);
            }
        }

        const purchase = new EquipmentPurchase({
            userId: req.user.id,
            items,
            totalPrice,
            shippingAddress
        });

        await purchase.save();

        // Update stock
        for (const item of items) {
            await Equipment.findByIdAndUpdate(item.equipmentId, {
                $inc: { quantity: -item.quantity }
            });
        }

        res.status(201).json(purchase);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get my purchases
exports.getMyPurchases = async (req, res) => {
    try {
        const purchases = await EquipmentPurchase.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(purchases);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Admin: Get all purchases
exports.getAllPurchases = async (req, res) => {
    try {
        const purchases = await EquipmentPurchase.find().populate('userId', 'name email').sort({ createdAt: -1 });
        res.status(200).json(purchases);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Admin: Update status
exports.updatePurchaseStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const purchase = await EquipmentPurchase.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!purchase) return res.status(404).json({ error: 'Purchase not found' });
        res.status(200).json(purchase);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
