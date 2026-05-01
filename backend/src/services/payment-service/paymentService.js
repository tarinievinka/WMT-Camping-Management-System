const Payment = require('../../models/payement-model/PaymentModel');
const GuideBooking = require('../../models/guide-booking-model/guideBookingModel');
const Reservation = require('../../models/reservation-models/Reservation');
const CustomerNotification = require('../../models/customer-notification-model/customerNotificationModel');
const User = require('../../models/user-models/User'); // Correcting based on directory structure seen earlier

const createPayment = async (data) => {
  // Prevent duplicate payments for the same booking
  const existing = await Payment.findOne({ 
    bookingId: data.bookingId,
    paymentStatus: { $in: ['pending', 'success'] }
  });

  if (existing) {
    throw new Error("A payment for this booking already exists or is pending approval.");
  }

  const payment = new Payment(data);
  return await payment.save();
};

const getAllPayments = async () => {
  return await Payment.find();
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
        await GuideBooking.findByIdAndUpdate(payment.bookingId, { status: 'paid' });
      } else if (payment.bookingType === 'CampsiteBooking') {
        await Reservation.findByIdAndUpdate(payment.bookingId, { status: 'confirmed' });
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
  }

  return payment;
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  updatePaymentStatus
};
