const express = require('express');
const logisticsController = require('../controllers/logisticsController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Register Truck
router.post('/truck/register', authMiddleware, logisticsController.registerTruck);

// Get Organization Trucks
router.get('/trucks', authMiddleware, logisticsController.getOrgTrucks);

// Get Assigned Orders
router.get('/orders', authMiddleware, logisticsController.getAssignedOrders);

// Update Truck Availability
router.put('/truck/availability', authMiddleware, logisticsController.updateTruckAvailability);

// Mark Delivery Complete
router.post('/delivery/complete', authMiddleware, logisticsController.markDeliveryComplete);

// Update Truck Location
router.put('/truck/location', authMiddleware, logisticsController.updateTruckLocation);

module.exports = router;
