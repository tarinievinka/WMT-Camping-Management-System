const express = require('express');
const router = express.Router();
const feedbackController = require('../../controllers/feedback-controller/feedbackController');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});
const upload = multer({ storage: storage });

// Create
router.post('/add', upload.array('images', 5), feedbackController.createFeedback);

// Get all
router.get('/display', feedbackController.getAllFeedbacks);

// Get by ID
router.get('/:id', feedbackController.getFeedbackById);

// Update
router.put('/update/:id', upload.array('images', 5), feedbackController.updateFeedback);

// Delete
router.delete('/delete/:id', feedbackController.deleteFeedback);

// Analytics
router.get('/analytics/average', feedbackController.getAverageRating);
router.get('/analytics/top', feedbackController.getTopRated);

module.exports = router;