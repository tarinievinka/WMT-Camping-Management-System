const express = require('express');
const router = express.Router();
const campsiteController = require('../../controllers/campsite-controller/campsiteController');
const upload = require('../../config/upload'); 
const { protect, admin, campsiteOwner } = require('../../utils/auth');

// Create a new campsite with image upload (authenticated owners)
router.post('/add', protect, campsiteOwner, upload.single('image'), campsiteController.createCampsite);


// Get all campsites
router.get('/', campsiteController.getAllCampsites);
router.get('/display', campsiteController.getAllCampsites);

// Get campsites for the logged-in owner
router.get('/mine', protect, campsiteOwner, campsiteController.getMyCampsites);

// Get a specific campsite
router.get('/:id', campsiteController.getCampsiteById);

// Get campsites by owner
router.get('/owner/:ownerId', campsiteController.getSitesByOwner);

// Update a campsite with optional new image upload
router.put('/update/:id', protect, campsiteOwner, upload.single('image'), campsiteController.updateCampsite);


// Update approval status (admin)
router.put('/update-status/:id', campsiteController.updateStatus);

// Delete a campsite
router.delete('/delete/:id', protect, campsiteOwner, campsiteController.deleteCampsite);


module.exports = router;
