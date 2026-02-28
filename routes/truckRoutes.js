const express = require('express');
const router = express.Router();
const truckController = require('../controllers/truckController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/register', truckController.registerTruck);
router.post('/login', truckController.loginTruck);

// Protected routes (require authentication)
router.get('/profile', authMiddleware, truckController.getTruckProfile);
router.put('/status', authMiddleware, truckController.updateTruckStatus);
router.get('/active-cluster', authMiddleware, truckController.getActiveCluster);
router.post('/accept-cluster', authMiddleware, truckController.acceptCluster);
router.post('/decline-cluster', authMiddleware, truckController.declineCluster);
router.post('/mark-pickup', authMiddleware, truckController.markPickupComplete);
router.post('/mark-delivery', authMiddleware, truckController.markDeliveryComplete);
router.get('/trip-history', authMiddleware, truckController.getTripHistory);

module.exports = router;
