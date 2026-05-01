const Equipment = require('../../models/Equipment-model/EquipmentModel');
const Notify = require('../../models/Notify-model/NotifyModel');
const CustomerNotification = require('../../models/customer-notification-model/customerNotificationModel');
const mongoose = require('mongoose');
const { sendEmail } = require('../../utils/emailUtils');

const createEquipment = async (data) => {
  const equipment = new Equipment(data);
  return await equipment.save();
};

const getAllEquipment = async () => {
  const equipments = await Equipment.find().lean();

  // Aggregate feedback to get average rating per equipment
  const Feedback = require('../../models/feedback-model/FeedbackModel');
  const feedbacks = await Feedback.find({ targetType: 'Equipment' }).lean();

  return equipments.map(eq => {
    // Match exactly like EquipmentDetail.jsx: by targetId OR targetName
    const eqFeedbacks = feedbacks.filter(f => {
      const idMatch = f.targetId && f.targetId.toString() === eq._id.toString();
      const nameMatch = f.targetName && f.targetName.trim().toLowerCase() === eq.name.trim().toLowerCase();
      return idMatch || nameMatch;
    });
    const reviewCount = eqFeedbacks.length;
    const averageRating = reviewCount > 0
      ? eqFeedbacks.reduce((sum, f) => sum + f.rating, 0) / reviewCount

      : 0;

    return {
      ...eq,
      description: eq.description || "",

      averageRating,
      reviewCount
    };
  });
};

const getEquipmentById = async (id) => {
  return await Equipment.findById(id);
};

const updateEquipment = async (id, data) => {
  console.log(`\n[EQUIPMENT_DEBUG] --- Update Started ---`);
  console.log(`[EQUIPMENT_DEBUG] Item ID: ${id}`);


  const oldEquipment = await Equipment.findById(id);
  const updated = await Equipment.findByIdAndUpdate(id, data, { new: true });

  if (updated) {
    const oldStock = oldEquipment ? oldEquipment.stockQuantity : 'N/A';
    const newStock = updated.stockQuantity;
    const status = updated.availabilityStatus;

    console.log(`[EQUIPMENT_DEBUG] "${updated.name}" | Stock: ${oldStock} -> ${newStock} | Status: ${status}`);

    // Simplified trigger: If it has stock and is available, notify anyone waiting.
    if (newStock > 0 && status === 'Available') {
      console.log(`[EQUIPMENT_DEBUG] Item is available. Searching for Notify requests...`);
      // Try finding by either string ID or ObjectId to be 100% sure
      const requests = await Notify.find({
        itemId: id,
        notified: false
      });

      console.log(`[EQUIPMENT_DEBUG] Found ${requests.length} pending requests in Notify collection.`);

      for (const req of requests) {
        try {
          const targetEmail = String(req.email || '').trim().toLowerCase();
          console.log(`[EQUIPMENT_DEBUG] Processing notification for: ${targetEmail}`);
          // 1. Create In-App Notification (Step 3: backend sets restocked: true)
          const newNotif = await CustomerNotification.create({
            customerName: "Camper",

            customerEmail: targetEmail,
            title: "Equipment Restocked!",
            body: `Good news! "${updated.name}" is now back in stock. Since you requested to be notified, we've updated the stock for you. You can now rent or buy it in the Equipment Store.`,
            read: false,
            restocked: true,
            alertSent: false
          });

          console.log(`[EQUIPMENT_DEBUG] Created CustomerNotification ID: ${newNotif._id} for ${targetEmail}`);

          // 2. Email (if configured)
          if (process.env.EMAIL_USER) {
            try {
              await sendEmail({
                email: targetEmail,
                subject: `Restock Alert: ${updated.name} is back!`,
                message: `<h3>Great news!</h3><p>The <b>${updated.name}</b> you were waiting for is back in stock.</p><p>Visit our store to get it now!</p>`
              });
              console.log(`[EQUIPMENT_DEBUG] Sent email to ${targetEmail}`);
            } catch (emailErr) {
              console.error(`[EQUIPMENT_DEBUG] Email failed: ${emailErr.message}`);
            }
          }

          // Mark request as notified
          req.notified = true;
          await req.save();
          console.log(`[EQUIPMENT_DEBUG] Mark Notify record as notified: DONE`);
        } catch (notifyErr) {
          console.error(`[EQUIPMENT_DEBUG] ERROR for ${req.email}:`, notifyErr.message);
        }
      }
    } else {
      console.log(`[EQUIPMENT_DEBUG] Trigger skipped. Stock: ${newStock}, Status: ${status}`);
    }
  }
  console.log(`[EQUIPMENT_DEBUG] --- Update Finished ---\n`);
  return updated;
};

const deleteEquipment = async (id) => {
  return await Equipment.findByIdAndDelete(id);
};

const updateAvailabilityStatus = async (id, status) => {
  const equipment = await Equipment.findById(id);
  if (!equipment) return null;
  equipment.availabilityStatus = status;
  await equipment.save();
  return equipment;
};

// ── NEW: reduce stock when user confirms a booking ──────────
const reduceStock = async (id, quantity, mode) => {
  const equipment = await Equipment.findById(id);
  if (!equipment) return null;

  // Reduce stock by the booked quantity — never go below 0
  const newStock = Math.max(0, equipment.stockQuantity - quantity);
  equipment.stockQuantity = newStock;

  // Auto-update status based on new stock + booking mode
  if (newStock === 0) {
    // Rented = all units are currently rented out (can come back)
    // Out of Stock = units are sold permanently
    equipment.availabilityStatus = mode === 'rent' ? 'Rented' : 'Out of Stock';
  } else {
    // Still has stock — keep as Available
    equipment.availabilityStatus = 'Available';
  }

  return await equipment.save();
};

module.exports = {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  updateAvailabilityStatus,
  reduceStock,
};