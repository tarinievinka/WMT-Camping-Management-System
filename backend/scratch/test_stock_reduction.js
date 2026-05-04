const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const Equipment = require('../src/models/Equipment-model/EquipmentModel');
const EquipmentPurchase = require('../src/models/Equipment-model/EquipmentPurchase');
const Payment = require('../src/models/payement-model/PaymentModel');
const paymentService = require('../src/services/payment-service/paymentService');

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Create dummy equipment
        const equipment = new Equipment({
            name: 'Test Tent ' + Date.now(),
            category: 'Tents',
            condition: 'New',
            rentalPrice: 50,
            salePrice: 100,
            stockQuantity: 10,
            availabilityStatus: 'Available',
            description: 'Test'
        });
        await equipment.save();
        console.log(`Created equipment: ${equipment.name} with stock ${equipment.stockQuantity}`);

        // 2. Create pending purchase
        const purchase = new EquipmentPurchase({
            userId: new mongoose.Types.ObjectId(), // dummy
            items: [{
                equipmentId: equipment._id,
                name: equipment.name,
                quantity: 2,
                price: 100,
                bookingType: 'buy'
            }],
            totalPrice: 200,
            status: 'pending'
        });
        await purchase.save();
        console.log(`Created pending purchase: ${purchase._id}`);

        // 3. Verify stock is NOT reduced yet
        const equipmentAfterPending = await Equipment.findById(equipment._id);
        console.log(`Stock after pending: ${equipmentAfterPending.stockQuantity} (Expected: 10)`);
        if (equipmentAfterPending.stockQuantity !== 10) throw new Error('Stock reduced too early!');

        // 4. Create a payment record
        const payment = new Payment({
            userId: purchase.userId,
            bookingId: purchase._id.toString(),
            bookingType: 'EquipmentBooking',
            amount: 200,
            paymentMethod: 'card',
            paymentStatus: 'pending'
        });
        await payment.save();
        console.log(`Created payment record: ${payment._id}`);

        // 5. Update payment status to success (this should trigger stock reduction)
        console.log('Updating payment status to success...');
        await paymentService.updatePaymentStatus(payment._id, 'success');

        // 6. Verify stock IS reduced now
        const equipmentAfterSuccess = await Equipment.findById(equipment._id);
        console.log(`Stock after success: ${equipmentAfterSuccess.stockQuantity} (Expected: 8)`);
        if (equipmentAfterSuccess.stockQuantity !== 8) throw new Error('Stock NOT reduced on success!');

        // 7. Test double-success protection
        console.log('Updating payment status to success AGAIN (should not reduce stock twice)...');
        await paymentService.updatePaymentStatus(payment._id, 'success');
        
        const equipmentAfterDoubleSuccess = await Equipment.findById(equipment._id);
        console.log(`Stock after double success: ${equipmentAfterDoubleSuccess.stockQuantity} (Expected: 8)`);
        if (equipmentAfterDoubleSuccess.stockQuantity !== 8) throw new Error('Stock reduced TWICE!');

        console.log('--- TEST PASSED ---');

        // Cleanup
        await Equipment.findByIdAndDelete(equipment._id);
        await EquipmentPurchase.findByIdAndDelete(purchase._id);
        await Payment.findByIdAndDelete(payment._id);
        console.log('Cleanup done');

    } catch (err) {
        console.error('--- TEST FAILED ---');
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

test();
