const express = require('express');
const priceController = require('../controllers/priceController');
const router = express.Router();

// Get all mandi prices
router.get('/mandi-prices', priceController.getMandiPrices);

// Get prices by commodity
router.get('/commodity/:commodity', priceController.getPricesByCommodity);

// Get prices by state
router.get('/state/:state', priceController.getPricesByState);

// Get commodities list
router.get('/commodities', priceController.getCommoditiesList);

module.exports = router;
