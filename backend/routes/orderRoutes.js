const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Buyer Profile
router.get('/buyer/profile', authMiddleware, orderController.getBuyerProfile);

// Order Request Flow
router.post('/request', authMiddleware, orderController.createOrderRequest);
router.put('/:orderId/accept', authMiddleware, orderController.acceptOrderRequest);
router.put('/:orderId/reject', authMiddleware, orderController.rejectOrderRequest);

// Buyer Order Management
router.get('/buyer/pending-requests', authMiddleware, orderController.getBuyerPendingRequests);
router.get('/buyer/accepted-orders', authMiddleware, orderController.getBuyerAcceptedOrders);
router.get('/buyer/orders', authMiddleware, orderController.getBuyerOrders);

// Process UPI Payment
router.post('/payment/upi', authMiddleware, orderController.processUPIPayment);

// Get Farmer Orders
router.get('/farmer/orders', authMiddleware, orderController.getFarmerOrders);

// Get Order Details
router.get('/:orderId', authMiddleware, orderController.getOrderDetails);

// Update Order Status
router.put('/status', authMiddleware, orderController.updateOrderStatus);

// Release Payment
router.post('/payment/release', authMiddleware, orderController.releasePayment);

module.exports = router;
