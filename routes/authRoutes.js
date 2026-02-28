const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// Farmer Routes
router.post('/farmer/register', authController.registerFarmer);
router.post('/farmer/login', authController.loginFarmer);

// Buyer Routes
router.post('/buyer/register', authController.registerBuyer);
router.post('/buyer/login', authController.loginBuyer);

// Logistics Routes
router.post('/logistics/register', authController.registerLogistics);
router.post('/logistics/login', authController.loginLogistics);

// Admin Routes
router.post('/admin/login', authController.loginAdmin);

module.exports = router;
