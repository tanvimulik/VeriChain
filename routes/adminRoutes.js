const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Approve Farmer
router.post('/approve-farmer', authMiddleware, adminController.approveFarmer);

// Approve Buyer
router.post('/approve-buyer', authMiddleware, adminController.approveBuyer);

// Approve Logistics
router.post('/approve-logistics', authMiddleware, adminController.approveLogistics);

// Get Pending Farmers
router.get('/pending-farmers', authMiddleware, adminController.getPendingFarmers);

// Get Pending Buyers
router.get('/pending-buyers', authMiddleware, adminController.getPendingBuyers);

// Get Dashboard Analytics
router.get('/analytics', authMiddleware, adminController.getDashboardAnalytics);

module.exports = router;
