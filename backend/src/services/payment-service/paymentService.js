const mongoose = require('mongoose');
const Payment = require('../../models/payement-model/PaymentModel');
const GuideBooking = require('../../models/guide-booking-model/guideBookingModel');
const Reservation = require('../../models/reservation-models/Reservation');
const CustomerNotification = require('../../models/customer-notification-model/customerNotificationModel');
const User = require('../../models/user-models/User');
const EquipmentPurchase = require('../../models/Equipment-model/EquipmentPurchase');

const createPayment = async (data) => {
  const payment = new Payment(data);
  const savedPayment = await payment.save();

  // If the payment is created with immediate success (e.g. Card/GPay)
  if (data.paymentStatus === 'success') {
    try {
      if (data.bookingType === 'GuideBooking') {
        await GuideBooking.findByIdAndUpdate(data.bookingId, { status: 'Payment Confirmed' });
      } else if (data.bookingType === 'CampsiteBooking') {
        await Reservation.findByIdAndUpdate(data.bookingId, { status: 'Payment Confirmed' });
      } else if (data.bookingType === 'EquipmentBooking') {
        await EquipmentPurchase.findByIdAndUpdate(data.bookingId, { status: 'paid' });
      }
      
      const user = await User.findById(data.userId);
      if (user) {
        const notification = new CustomerNotification({
          customerName: user.name || user.fullName || 'Valued Camper',
          customerEmail: user.email,
          title: 'Payment Successful! 🎉',
          body: `Your payment of LKR ${data.amount} for booking #${data.bookingId?.slice(-6)} has been received. Your status is now "Payment Completed".`,
          bookingId: data.bookingType === 'GuideBooking' ? data.bookingId : null,
          read: false
        });
        await notification.save();
      }
    } catch (err) {
      console.error('Error in immediate payment processing:', err);
    }
  } else if (data.paymentMethod === 'bank-deposit') {
    // For bank deposits, ensure the booking status is set to 'pending'
    try {
      if (data.bookingType === 'GuideBooking') {
        await GuideBooking.findByIdAndUpdate(data.bookingId, { status: 'pending' });
      } else if (data.bookingType === 'CampsiteBooking') {
        await Reservation.findByIdAndUpdate(data.bookingId, { status: 'pending' });
      } else if (data.bookingType === 'EquipmentBooking') {
        await EquipmentPurchase.findByIdAndUpdate(data.bookingId, { status: 'pending' });
      }
      
      console.log(`[PAYMENT_SERVICE] Booking ${data.bookingId} set to pending for bank deposit.`);
    } catch (err) {
      console.error('Error setting booking to pending for bank deposit:', err);
    }
  }
  return savedPayment;
};

const getAllPayments = async () => {
  return await Payment.find();
};



const getPaymentsByUser = async (userId) => {
  try {
    const queryId = new mongoose.Types.ObjectId(userId);
    return await Payment.find({ userId: queryId }).sort({ createdAt: -1 });
  } catch (err) {
    // If it's not a valid ObjectId string, try finding by string as backup
    return await Payment.find({ userId }).sort({ createdAt: -1 });
  }
};

const getPaymentById = async (id) => {
  return await Payment.findById(id);
};

const updatePayment = async (id, data) => {
  return await Payment.findByIdAndUpdate(id, data, { new: true });
};

const deletePayment = async (id) => {
  return await Payment.findByIdAndDelete(id);
};

const updatePaymentStatus = async (id, status) => {
  const payment = await Payment.findById(id);
  if (!payment) return null;
  
  payment.paymentStatus = status;
  if (status === 'success') payment.paidAt = new Date();
  await payment.save();

  // If payment is approved (success), update the corresponding booking and notify user
  if (status === 'success') {
    try {
      // 1. Update Booking Status
      if (payment.bookingType === 'GuideBooking') {
        await GuideBooking.findByIdAndUpdate(payment.bookingId, { status: 'Payment Confirmed' });
      } else if (payment.bookingType === 'CampsiteBooking') {
        await Reservation.findByIdAndUpdate(payment.bookingId, { status: 'Payment Confirmed' });
      } else if (payment.bookingType === 'EquipmentBooking') {
        await EquipmentPurchase.findByIdAndUpdate(payment.bookingId, { status: 'paid' });
      }

      // 2. Notify User
      const user = await User.findById(payment.userId);
      if (user) {
        const notification = new CustomerNotification({
          customerName: user.name || user.fullName || 'Valued Camper',
          customerEmail: user.email,
          title: 'Payment Approved! 🎉',
          body: `Your payment of LKR ${payment.amount} for booking #${payment.bookingId?.slice(-6)} has been approved. Your status is now "Payment Completed".`,
          bookingId: payment.bookingType === 'GuideBooking' ? payment.bookingId : null,
          read: false
        });
        await notification.save();
      }
    } catch (err) {
      console.error('Error updating booking status or sending notification:', err);
      // We don't throw here to avoid breaking the payment update itself
    }
  } else if (status === 'failed') {
    try {
      const user = await User.findById(payment.userId);
      if (user) {
        const notification = new CustomerNotification({
          customerName: user.name || user.fullName || 'Valued Camper',
          customerEmail: user.email,
          title: 'Payment Failed ❌',
          body: `Unfortunately, your payment of LKR ${payment.amount} for booking #${payment.bookingId?.slice(-6)} was rejected. Please check your payment details and try again.`,
          bookingId: payment.bookingId,
          read: false
        });
        await notification.save();
      }
    } catch (err) {
      console.error('Error sending failed payment notification:', err);
    }
  }


  return payment;
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentsByUser,
  getPaymentById,
  updatePayment,
  deletePayment,
  updatePaymentStatus
};
