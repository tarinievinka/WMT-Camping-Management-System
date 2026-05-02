const express = require("express");
const router = express.Router();

const guideController = require("../../controllers/guide-controller/guidecontroller");
const guideUploadController = require("../../controllers/upload-controller/guideUploadController");
const cvUploadController = require("../../controllers/upload-controller/cvUploadController");
const { upload } = require("../../middleware/guideUpload");
const { uploadCV } = require("../../middleware/cvUpload");

// Create guide
router.post("/add", guideController.createGuide);

// Image upload for guide profile / cover / gallery (stores file under /uploads)
router.post("/upload-image", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Invalid file upload" });
    }
    next();
  });
}, guideUploadController.uploadGuideImage);

// CV upload for guide (PDF/DOC)
router.post("/upload-cv", (req, res, next) => {
  uploadCV.single("cv")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Invalid CV upload. Only PDF/DOC/DOCX up to 10MB allowed." });
    }
    next();
  });
}, cvUploadController.uploadGuideCV);

const { protect, adminOnly } = require("../../middleware/authMiddleware");

// Get guides
router.get("/", guideController.getAllGuides);
router.get("/display", guideController.getAllGuides);

// Get my guide profile
router.get("/me", protect, guideController.getMyGuideProfile);

// Get  by ID
router.get("/update/:id", guideController.getGuideById);

// Update 
router.put("/update/:id", guideController.updateGuide);

// Approve guide 
router.patch("/:id/approve", guideController.approveGuide);

// Delete guide
router.delete("/delete/:id", protect, adminOnly, guideController.deleteGuide);

module.exports = router;