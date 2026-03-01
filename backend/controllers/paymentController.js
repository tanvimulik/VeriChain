const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { runClustering } = require('../services/clusteringService');

// TEST MODE SIMULATION - No real Razorpay needed!
// This simulates payment processing for development/testing

// Create Payment Order (Simulated)
exports.createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    console.log('=== CREATE PAYMENT ORDER (SIMULATION) ===');
    console.log('Received orderId:', orderId);
    
    // Fetch order details
    const order = await Order.findById(orderId);
    if (!order) {
      console.log('❌ Order not found:', orderId);
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    console.log('✅ Order found:', {
      _id: order._id,
      orderId: order.orderId,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus
    });

    // Check if already paid
    if (order.paymentStatus === 'paid') {
      console.log('❌ Order already paid');
      return res.status(400).json({ 
        success: false,
        message: 'Order already paid' 
      });
    }

    // Create simulated payment order
    const simulatedOrderId = `test_order_${Date.now()}`;
    const amountInPaise = Math.round(order.totalAmount * 100);
    
    console.log('✅ Simulated payment order created:', simulatedOrderId);
    console.log('Amount:', amountInPaise, 'paise (₹' + order.totalAmount + ')');
    console.log('========================================');

    res.json({
      success: true,
      orderId: simulatedOrderId,
      amount: amountInPaise,
      currency: 'INR',
      testMode: true,
      message: 'Test mode - No real money will be charged',
      orderDetails: {
        _id: order._id,
        cropType: order.cropType,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        farmerName: order.farmerName,
      },
    });
  } catch (error) {
    console.error('=== PAYMENT ORDER ERROR ===');
    console.error('Error:', error.message);
    console.error('===========================');
    
    res.status(500).json({ 
      success: false,
      message: 'Error creating payment order',
      error: error.message 
    });
  }
};

// Test Payment (Simulated Success)
exports.testPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    console.log('=== TEST PAYMENT (SIMULATION) ===');
    console.log('Processing payment for orderId:', orderId);
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Simulate successful payment
    order.paymentStatus = 'paid';
    order.orderStatus = 'paid';
    order.transactionId = `TEST_${Date.now()}`;
    order.paymentDate = new Date();
    order.paymentMethod = 'Test Mode (Simulated)';
    await order.save();

    // Create payment record
    const payment = new Payment({
      orderId: order._id,
      buyerId: order.buyerId,
      farmerId: order.farmerId,
      amount: order.totalAmount,
      transactionId: order.transactionId,
      paymentMethod: 'Test Mode (Simulated)',
      status: 'completed',
    });
    await payment.save();

    // Create notification for farmer
    try {
      await Notification.create({
        userId: order.farmerId,
        userType: 'Farmer',
        type: 'payment_received',
        title: '💰 Payment Received!',
        message: `Buyer has completed payment of ₹${order.totalAmount} for order #${order.orderId}. Your crop will be picked up soon.`,
        orderId: order._id,
        isRead: false,
      });
      console.log('✅ Farmer notification created');
    } catch (notifError) {
      console.error('Error creating notification:', notifError.message);
    }

    // 🚛 AUTO-TRIGGER CLUSTERING AFTER PAYMENT SUCCESS
    console.log('🔄 Auto-triggering clustering for truck assignment...');
    try {
      const clusteringResult = await runClustering();
      console.log('✅ Clustering completed:', clusteringResult.message);
      console.log(`📦 Clusters created: ${clusteringResult.clustersCreated}`);
    } catch (clusterError) {
      console.error('⚠️ Clustering error (non-critical):', clusterError.message);
      // Don't fail payment if clustering fails - it will run again in cron job
    }

    console.log('✅ Test payment successful');
    console.log('Transaction ID:', order.transactionId);
    console.log('=================================');

    res.json({
      success: true,
      message: 'Test payment successful',
      order: order,
      transactionId: order.transactionId,
    });
  } catch (error) {
    console.error('=== TEST PAYMENT ERROR ===');
    console.error('Error:', error.message);
    console.error('==========================');
    
    res.status(500).json({
      success: false,
      message: 'Error processing test payment',
      error: error.message,
    });
  }
};

// Verify Payment (Simulated)
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpay_payment_id } = req.body;
    
    console.log('=== VERIFY PAYMENT (SIMULATION) ===');
    console.log('Verifying payment for orderId:', orderId);
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Simulate payment verification
    order.paymentStatus = 'paid';
    order.orderStatus = 'paid';
    order.transactionId = razorpay_payment_id || `TEST_${Date.now()}`;
    order.paymentDate = new Date();
    order.paymentMethod = 'Test Mode (Simulated)';
    await order.save();

    // Create payment record
    const payment = new Payment({
      orderId: order._id,
      buyerId: order.buyerId,
      farmerId: order.farmerId,
      amount: order.totalAmount,
      transactionId: order.transactionId,
      paymentMethod: 'Test Mode (Simulated)',
      status: 'completed',
    });
    await payment.save();

    // Create notification for farmer
    try {
      await Notification.create({
        userId: order.farmerId,
        userType: 'Farmer',
        type: 'payment_received',
        title: '💰 Payment Received!',
        message: `Buyer has completed payment of ₹${order.totalAmount} for order #${order.orderId}. Your crop will be picked up soon.`,
        orderId: order._id,
        isRead: false,
      });
      console.log('✅ Farmer notification created');
    } catch (notifError) {
      console.error('Error creating notification:', notifError.message);
    }

    // 🚛 AUTO-TRIGGER CLUSTERING AFTER PAYMENT SUCCESS
    console.log('🔄 Auto-triggering clustering for truck assignment...');
    try {
      const clusteringResult = await runClustering();
      console.log('✅ Clustering completed:', clusteringResult.message);
      console.log(`📦 Clusters created: ${clusteringResult.clustersCreated}`);
    } catch (clusterError) {
      console.error('⚠️ Clustering error (non-critical):', clusterError.message);
      // Don't fail payment if clustering fails - it will run again in cron job
    }

    console.log('✅ Payment verified successfully');
    console.log('===================================');

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order: order,
    });
  } catch (error) {
    console.error('=== VERIFY PAYMENT ERROR ===');
    console.error('Error:', error.message);
    console.error('============================');
    
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message,
    });
  }
};

// Get Payment Details
exports.getPaymentDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const payment = await Payment.findOne({ orderId })
      .populate('orderId')
      .populate('buyerId')
      .populate('farmerId');

    if (!payment) {
      return res.status(404).json({ 
        success: false,
        message: 'Payment not found' 
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment details',
      error: error.message,
    });
  }
};
