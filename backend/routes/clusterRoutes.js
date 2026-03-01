const express = require('express');
const router = express.Router();
const clusterController = require('../controllers/clusterController');
const authMiddleware = require('../middleware/auth');

// Trigger clustering (can be called manually or by cron job)
router.post('/run', clusterController.triggerClustering);

// Debug endpoint to check orders
router.get('/debug/orders', clusterController.debugOrders);

// Debug endpoint to verify route optimization
router.get('/debug/route/:clusterId', clusterController.debugRouteOptimization);

// Get all clusters
router.get('/', authMiddleware, clusterController.getAllClusters);

// Get cluster by ID
router.get('/:id', authMiddleware, clusterController.getClusterById);

// Get clustering statistics
router.get('/stats/overview', clusterController.getClusteringStats);

module.exports = router;
