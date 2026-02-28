const express = require('express');
const paymentController = require('../controllers/paymentController');
const router = express.Router();

// Create payment order
router.post('/create-order', paymentController.createPaymentOrder);

// Verify payment
router.post('/verify', paymentController.verifyPayment);

// Get payment details
router.get('/:orderId', paymentController.getPaymentDetails);

// Test payment (development only)
router.post('/test-payment', paymentController.testPayment);

module.exports = router;
