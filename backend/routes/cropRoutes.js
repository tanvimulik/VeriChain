const express = require('express');
const cropController = require('../controllers/cropController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// List Crop (Farmer)
router.post('/list', authMiddleware, cropController.listCrop);

// Get Available Crops (Buyer)
router.get('/available', cropController.getAvailableCrops);

// Get Farmer's Listings
router.get('/my-listings', authMiddleware, cropController.getFarmerListings);

// Get Crop Details
router.get('/:cropId', cropController.getCropDetails);

// Search Crops
router.get('/search', cropController.searchCrops);

module.exports = router;
