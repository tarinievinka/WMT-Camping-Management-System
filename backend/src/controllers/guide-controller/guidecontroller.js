const Guide = require("../../models/guide-model/guidemodel");
const User = require("../../models/user-model/userModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sendEmail } = require("../../utils/emailUtils");


// Create a new guide
exports.createGuide = async (req, res) => {
  try {
    const guide = new Guide(req.body);
    await guide.save();
    res.status(201).json(guide);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all guides
exports.getAllGuides = async (req, res) => {
  try {
    const guideService = require("../../services/guide-service/guideService");
    const guides = await guideService.getAllGuides();
    res.json({ success: true, data: guides });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a guide by ID
exports.getGuideById = async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);

    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    res.json(guide);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a guide
exports.updateGuide = async (req, res) => {
  try {
    const guide = await Guide.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    res.json(guide);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete guide
exports.deleteGuide = async (req, res) => {
  try {
    const guide = await Guide.findByIdAndDelete(req.params.id);

    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    res.json({ message: "Guide deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve guide
exports.approveGuide = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "guide") {
      return res.status(400).json({ message: "User is not a guide applicant" });
    }

    // 1. Generate a random temporary password
    const tempPassword = crypto.randomBytes(4).toString('hex'); // 8 characters
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    console.log(`[GUIDE_APPROVAL] Approving user: ${user.email} (${user._id})`);
    console.log(`[GUIDE_APPROVAL] Generated temp password: ${tempPassword}`);

    // 2. Update user status and password
    await User.findByIdAndUpdate(userId, {
      guideStatus: 'approved',
      isActive: true,
      password: hashedPassword
    });
    
    console.log(`[GUIDE_APPROVAL] User document updated successfully via findByIdAndUpdate.`);

    // 3. Send approval email
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; borderRadius: 12px;">
        <h1 style="color: #10a110; text-align: center;">Welcome to Smart Camping!</h1>
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Congratulations! Your application to become a <strong>Smart Camping Guide</strong> has been approved.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #f1f5f9;">
          <p style="margin-top: 0;"><strong>Your Login Credentials:</strong></p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Temporary Password:</strong> <span style="font-family: monospace; font-size: 16px; background: #fff; padding: 4px 8px; border: 1px dashed #cbd5e1; border-radius: 4px;">${tempPassword}</span></p>
        </div>

        <p>You can now log in to your dashboard to manage your bookings and profile:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${loginUrl}" style="background-color: #10a110; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Log in to Dashboard</a>
        </div>

        <p style="color: #64748b; font-size: 14px;"><em>For security reasons, we recommend changing your password after your first login.</em></p>
        
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 32px 0;" />
        <p style="text-align: center; color: #94a3b8; font-size: 12px;">© 2026 Smart Camping Management System. All rights reserved.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Smart Camping - Guide Application Approved!',
        message,
      });
    } catch (emailErr) {
      console.error("Email notification failed:", emailErr);
      // We continue since the user is already approved in the DB
    }


    // Prevent duplicate guide documents
    const existingGuide = await Guide.findOne({ email: user.email });
    if (existingGuide) {

      // Already approved — just return the existing guide
      return res.status(200).json({ message: "Guide approved successfully (Profile existed)", guide: existingGuide });
    }

    // Create a new Guide document using the application data
    // NOTE: nic and age are required by the Guide schema — must be included

    const app = user.guideApplication || {};
    const guideData = {
      name:        app.fullName || user.name,
      email:       user.email,
      phone:       user.phone || '',
      experience:  Number(app.experience) || 0,   // Guide schema expects Number
      nic:         app.nic || '',                  // required field
      age:         Number(app.age) || 18,          // required field

      description: app.description || '',
      language:    app.languages ? app.languages.join(', ') : '',
      cv:          app.cv || '',
      userId:      user._id
    };

    const newGuide = new Guide(guideData);
    await newGuide.save();

    res.status(200).json({ message: "Guide approved and notified successfully", guide: newGuide });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get my guide profile (for logged in guide)
exports.getMyGuideProfile = async (req, res) => {
  try {
    const guide = await Guide.findOne({ 
      $or: [
        { userId: req.user.id },
        { email: req.user.email }
      ]
    });
    if (!guide) return res.status(404).json({ message: "Guide profile not found" });
    res.json(guide);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};