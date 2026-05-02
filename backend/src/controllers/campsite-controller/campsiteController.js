const Campsite = require('../../models/campsite-model/CampsiteModel');

exports.createCampsite = async (req, res) => {
  try {
    const ownerId = req.user ? (req.user._id || req.user.id) : req.body.ownerId;

    let amenities = [];
    if (req.body.amenities) {
      if (typeof req.body.amenities === 'string') {
        try {
          amenities = JSON.parse(req.body.amenities);
        } catch (e) {
          amenities = req.body.amenities.split(',').map(a => a.trim());
        }
      } else if (Array.isArray(req.body.amenities)) {
        amenities = req.body.amenities;
      }
    }

    const newCampsite = new Campsite({
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : (req.body.image || (req.body.images && req.body.images[0]) || ''),
      images: req.body.images || [],
      amenities,
      ownerId,
      status: req.user && req.user.role === 'admin' ? 'approved' : 'pending'
    });

    await newCampsite.save();
    res.status(201).json({ success: true, data: newCampsite });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAllCampsites = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    console.log('[CAMPSITE] Fetching campsites with filter:', filter);
    const campsites = await Campsite.find(filter).lean();
<<<<<<< HEAD

    // Fetch all feedbacks to aggregate
    const Feedback = require('../../models/feedback & ticket-model/FeedbackModel');
=======
    console.log(`[CAMPSITE] Found ${campsites.length} campsites.`);
    
    /*
    // Fetch all feedbacks to aggregate
    console.log('[CAMPSITE] Fetching feedbacks...');
    const Feedback = require('../../models/feedback-model/FeedbackModel');
>>>>>>> f2ca66c5d095caae7da6519b6f3697a2aa8ded8d
    const allFeedbacks = await Feedback.find({ targetType: 'Campsite' }).lean();

    const dataWithRatings = campsites.map(site => {
      const siteFeedbacks = allFeedbacks.filter(f =>
        String(f.targetId || "") === String(site._id) ||
        String(f.targetName || "").trim().toLowerCase() === String(site.name || "").trim().toLowerCase()
      );

      const reviewCount = siteFeedbacks.length;
      const averageRating = reviewCount > 0
        ? siteFeedbacks.reduce((sum, f) => sum + f.rating, 0) / reviewCount
        : 0;

      return {
        ...site,
        averageRating,
        reviewCount
      };
    });

    res.json({ success: true, data: dataWithRatings });
    */
    console.log('[CAMPSITE] Sending response with', campsites.length, 'items');
    res.json({ success: true, data: campsites });
    console.log('[CAMPSITE] Response sent.');
  } catch (error) {
    console.error(`[CAMPSITE_CONTROLLER] Error in getAllCampsites:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCampsiteById = async (req, res) => {
  try {
    const campsite = await Campsite.findById(req.params.id).lean();
    if (!campsite) {
      return res.status(404).json({ success: false, error: "Campsite not found" });
    }

    // Fetch feedbacks for this campsite
    const Feedback = require('../../models/feedback & ticket-model/FeedbackModel');
    const feedbacks = await Feedback.find({
      targetType: 'Campsite',
      $or: [
        { targetId: campsite._id },
        { targetName: { $regex: new RegExp(`^${campsite.name}$`, 'i') } }
      ]
    }).lean();

    const reviewCount = feedbacks.length;
    const averageRating = reviewCount > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / reviewCount
      : 0;

    res.status(200).json({
      success: true,
      data: {
        ...campsite,
        averageRating,
        reviewCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSitesByOwner = async (req, res) => {
  try {
    const campsites = await Campsite.find({ ownerId: req.params.ownerId });
    res.status(200).json({ success: true, data: campsites });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMyCampsites = async (req, res) => {
  try {
    const ownerId = req.user._id ? req.user._id.toString() : req.user.id;
    console.log(`[CAMPSITE] Fetching dashboard for ownerId: ${ownerId}`);

    // Using .lean() to ensure we get plain JS objects and avoid Mongoose serialization issues
    const campsites = await Campsite.find({ ownerId: ownerId }).lean().sort({ createdAt: -1 });

    console.log(`[CAMPSITE] Dashboard sync: Found ${campsites.length} sites for ${ownerId}`);

    // Returning multiple formats to ensure frontend compatibility
    res.status(200).json({
      success: true,
      count: campsites.length,
      data: campsites,
      campsites: campsites // Redundant backup key
    });
  } catch (error) {
    console.error(`[CAMPSITE] Error in getMyCampsites: ${error.message}`);
    res.status(500).json({ success: false, error: "Failed to retrieve your campsites" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const campsite = await Campsite.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!campsite) {
      return res.status(404).json({ success: false, error: "Campsite not found" });
    }
    res.status(200).json({ success: true, data: campsite });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateCampsite = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    if (req.body.amenities) {
      updateData.amenities = JSON.parse(req.body.amenities);
    }

    const campsite = await Campsite.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!campsite) {
      return res.status(404).json({ success: false, error: "Campsite not found" });
    }
    res.status(200).json({ success: true, data: campsite });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteCampsite = async (req, res) => {
  try {
    const campsite = await Campsite.findByIdAndDelete(req.params.id);
    if (!campsite) {
      return res.status(404).json({ success: false, error: "Campsite not found" });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
