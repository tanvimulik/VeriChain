const express = require('express');
const router = express.Router();
const truckController = require('../controllers/truckController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/register', truckController.registerTruck);
router.post('/login', truckController.loginTruck);
router.get('/all', truckController.getAllTrucks); // Get all trucks (no auth required for debugging)
router.put('/status-by-phone', truckController.updateTruckStatusByPhone); // Update status by phone (no auth for testing)

// Protected routes (require authentication)
router.get('/profile', authMiddleware, truckController.getTruckProfile);
router.get('/:truckId/details', truckController.getTruckDetails); // Public endpoint for buyers/farmers
router.put('/status', authMiddleware, truckController.updateTruckStatus);
router.get('/active-cluster', authMiddleware, truckController.getActiveCluster);
router.post('/accept-cluster', authMiddleware, truckController.acceptCluster);
router.post('/decline-cluster', authMiddleware, truckController.declineCluster);
router.post('/mark-pickup-status', authMiddleware, truckController.markPickupStatus);
router.post('/mark-pickup', authMiddleware, truckController.markPickupComplete);
router.post('/mark-delivery', authMiddleware, truckController.markDeliveryComplete);
router.get('/trip-history', authMiddleware, truckController.getTripHistory);

module.exports = router;
