const express = require('express');
const router = express.Router();
const { Order, Crop, Farmer, Buyer, Payment, Cluster, ClusterAssignment } = require('../models');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// ==================================
// MVP ENDPOINTS
// ==================================

// Quick order endpoint - simplified buyer flow
router.post('/:cropId/quick-order', authMiddleware, roleMiddleware('buyer'), async (req, res) => {
  try {
    const { cropId } = req.params;
    const { quantity } = req.body;
    
    console.log('🔍 Quick order request:', { cropId, quantity });

    // Validate cropId
    if (!cropId || cropId === 'crop-id') {
      return res.status(400).json({ error: 'Invalid crop ID provided' });
    }

    // Get buyer
    const buyer = await Buyer.findOne({ userId: req.user.userId });
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer profile not found' });
    }

    // Get crop
    const crop = await Crop.findById(cropId).populate('farmerId');
    if (!crop) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    if (crop.quantity < quantity) {
      return res.status(400).json({ error: `Only ${crop.quantity}kg available` });
    }

    // Create order
    const mandiPrice = crop.mandiPrice || 2000;
    const transportFee = 200;
    const platformFee = 200;
    const totalPrice = mandiPrice + transportFee + platformFee;
    const totalAmount = totalPrice * quantity;

    const order = await Order.create({
      buyerId: buyer._id,
      farmerId: crop.farmerId,
      cropId: crop._id,
      quantity,
      priceOffered: mandiPrice,
      totalAmount: totalAmount,
      deliveryType: 'delivery', // Default to delivery for MVP
      status: 'pending', // Use valid enum value
      escrowStatus: 'held'
    });

    // Update crop status
    await Crop.findByIdAndUpdate(cropId, {
      status: 'clustered',
      orderId: order._id,
      quantity: crop.quantity - quantity
    });

    // Create payment record
    const payment = await Payment.create({
      orderId: order._id,
      buyerId: buyer._id,
      farmerId: crop.farmerId,
      totalAmount: totalAmount,
      mandiPrice: mandiPrice * quantity,
      transportFee: transportFee * quantity,
      platformFee: platformFee * quantity,
      status: 'pending',
      escrowStatus: 'held',
      breakdown: {
        farmer: Math.round(totalAmount * 0.73),
        truck: Math.round(totalAmount * 0.10),
        hub: Math.round(totalAmount * 0.04),
        platform: totalAmount - Math.round(totalAmount * 0.73) - Math.round(totalAmount * 0.10) - Math.round(totalAmount * 0.04)
      }
    });

    res.status(201).json({
      success: true,
      orderId: order._id,
      order: {
        cropType: crop.cropType,
        quantity,
        mandiPrice,
        transportFee,
        platformFee,
        totalPrice,
        totalAmount,
        status: 'pending'
      },
      payment: {
        id: payment._id,
        amount: totalAmount,
        breakdown: payment.breakdown,
        status: 'escrow'
      }
    });
  } catch (error) {
    console.error('Quick order error:', error);
    res.status(500).json({ error: 'Failed to place order', details: error.message });
  }
});

// Get farmer dashboard data
router.get('/dashboard', authMiddleware, roleMiddleware('farmer'), async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ userId: req.user.userId });
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }

    const crops = await Crop.find({ farmerId: farmer._id });
    const orders = await Order.find({ farmerId: farmer._id });
    const activeListings = crops.filter(c => c.status === 'available').length;
    const totalEarnings = 0; // Would calculate from completed payments
    const totalOrders = orders.length;
    const truckAssignments = orders.filter(o => o.status === 'assigned').length;

    res.json({
      activeListings,
      totalEarnings,
      totalOrders,
      truckAssignments,
      crops
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// ==================================
// ORIGINAL ENDPOINTS
// ==================================

// ✅ POST: Create order (Buyer places order)
router.post('/', authMiddleware, roleMiddleware('buyer'), async (req, res) => {
  try {
    const { crop_id, cropId, quantity, price_offered, priceOffered, delivery_date, deliveryDate, delivery_type, deliveryType } = req.body;

    const actualCropId = crop_id || cropId;
    const actualQuantity = quantity;
    const actualPrice = price_offered || priceOffered;
    const actualDeliveryDate = delivery_date || deliveryDate;
    const actualDeliveryType = delivery_type || deliveryType || 'delivery';

    // Get buyer profile
    const buyer = await Buyer.findOne({ userId: req.user.userId });
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer profile not found' });
    }

    // Check crop availability
    const crop = await Crop.findById(actualCropId);
    if (!crop) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    if (crop.status !== 'available') {
      return res.status(400).json({ error: 'Crop is not available' });
    }

    if (crop.quantity < actualQuantity) {
      return res.status(400).json({ error: `Insufficient quantity. Available: ${crop.quantity}kg, Requested: ${actualQuantity}kg` });
    }

    // Create order - status will be 'pending' until farmer accepts
    const order = await Order.create({
      buyerId: buyer._id,
      cropId: crop._id,
      quantity: actualQuantity,
      priceOffered: actualPrice,
      deliveryDate: actualDeliveryDate,
      deliveryType: actualDeliveryType,
      status: 'pending',
      escrowStatus: 'pending'
    });

    // ✅ Change crop status to 'assigned' (visible to farmer, hidden from other buyers in marketplace)
    await Crop.findByIdAndUpdate(
      crop._id,
      { status: 'assigned', orderId: order._id },
      { new: true }
    );

    // Notify farmer about new order
    const io = req.app.get('io');
    if (io) {
      io.emit('new-order-received', {
        orderId: order._id,
        buyerName: buyer.name,
        cropType: crop.cropType,
        quantity: actualQuantity,
        priceOffered: actualPrice,
        message: `New order from ${buyer.name}: ${actualQuantity}kg of ${crop.cropType}`
      });
    }

    res.status(201).json({
      message: 'Order placed successfully - awaiting farmer acceptance',
      order: {
        id: order._id,
        status: order.status,
        cropId: crop._id,
        quantity: actualQuantity,
        priceOffered: actualPrice,
        deliveryDate: actualDeliveryDate,
        next: 'Farmer will confirm receipt of order'
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// ✅ PUT: Accept order (Farmer)
router.put('/:id/accept', authMiddleware, roleMiddleware('farmer'), async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('cropId', 'farmerId')
      .populate('buyerId', 'name');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const farmer = await Farmer.findOne({ userId: req.user.userId });
    if (!farmer || farmer._id.toString() !== order.cropId.farmerId.toString()) {
      return res.status(403).json({ error: 'Unauthorized to accept this order' });
    }

    // Update order status
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status: 'accepted' },
      { new: true }
    );

    // Notify buyer
    const io = req.app.get('io');
    if (io) {
      io.emit('order-accepted', {
        orderId: updatedOrder._id,
        farmerName: farmer.name,
        message: `Farmer ${farmer.name} accepted your order`
      });
    }

    res.json({
      message: 'Order accepted - proceed to payment',
      order: {
        id: updatedOrder._id,
        status: updatedOrder.status,
        next: 'Buyer will proceed to payment'
      }
    });

  } catch (error) {
    console.error('Accept order error:', error);
    res.status(500).json({ error: 'Failed to accept order', details: error.message });
  }
});

// ✅ POST: Cancel order (Farmer or Buyer before acceptance)
router.post('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id)
      .populate('cropId')
      .populate('buyerId')
      .populate('farmerId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization
    const farmer = await Farmer.findOne({ userId: req.user.userId });
    const buyer = await Buyer.findOne({ userId: req.user.userId });

    if (!farmer && !buyer) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update order status
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true }
    );

    // Restore crop to available
    await Crop.findByIdAndUpdate(
      order.cropId._id,
      { status: 'available', orderId: null },
      { new: true }
    );

    // Notify other party
    const io = req.app.get('io');
    if (io) {
      io.emit('order-cancelled', {
        orderId: id,
        reason: reason || 'Order was cancelled',
        message: 'Order has been cancelled'
      });
    }

    res.json({
      message: 'Order cancelled successfully',
      order: {
        id: updatedOrder._id,
        status: updatedOrder.status,
        cropRestored: 'Crop is available in marketplace again'
      }
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order', details: error.message });
  }
});

// ✅ PUT: Confirm delivery (Buyer) - Triggers payment release
router.put('/:id/confirm-delivery', authMiddleware, roleMiddleware('buyer'), async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('paymentId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'in_transit') {
      return res.status(400).json({ error: 'Order is not in transit' });
    }

    // ✅ Mark order as delivered
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        status: 'delivered',
        deliveryConfirmed: true,
        deliveryConfirmedDate: new Date()
      },
      { new: true }
    );

    // ✅ Update crop status to delivered
    await Crop.findByIdAndUpdate(
      order.cropId,
      { status: 'delivered' }
    );

    // ✅ Release payment from escrow
    if (order.paymentId) {
      await Payment.findByIdAndUpdate(
        order.paymentId,
        {
          status: 'released',
          escrowStatus: 'released',
          releaseDate: new Date()
        }
      );
    }

    // Notify all parties
    const io = req.app.get('io');
    if (io) {
      io.emit('delivery-confirmed', {
        orderId: id,
        message: 'Delivery confirmed - payment released to farmer'
      });
    }

    res.json({
      message: 'Delivery confirmed - payment released to farmer',
      order: {
        id: updatedOrder._id,
        status: updatedOrder.status,
        deliveryConfirmedDate: updatedOrder.deliveryConfirmedDate
      }
    });

  } catch (error) {
    console.error('Confirm delivery error:', error);
    res.status(500).json({ error: 'Failed to confirm delivery', details: error.message });
  }
});

// ✅ GET: Get order details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate({
        path: 'cropId',
        populate: { path: 'farmerId', select: 'name village ratingScore' }
      })
      .populate('buyerId', 'name buyerType')
      .populate('clusterTruckId', 'truckNumber costPerKm')
      .populate('paymentId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const clusterInfo = order.clusterTruckId ? 
      await ClusterAssignment.findOne({ orderId: order._id }).populate('clusterId') : 
      null;

    res.json({
      order: {
        id: order._id,
        status: order.status,
        crop: {
          id: order.cropId._id,
          type: order.cropId.cropType,
          quantity: order.quantity,
          farmerName: order.cropId.farmerId.name,
          farmerVillage: order.cropId.farmerId.village,
          farmerRating: order.cropId.farmerId.ratingScore
        },
        buyer: {
          name: order.buyerId.name,
          type: order.buyerId.buyerType
        },
        pricing: {
          priceOffered: order.priceOffered,
          breakdown: order.priceBreakdown,
          totalAmount: order.priceBreakdown?.totalAmount
        },
        delivery: {
          type: order.deliveryType,
          date: order.deliveryDate,
          confirmed: order.deliveryConfirmed,
          confirmedDate: order.deliveryConfirmedDate
        },
        truck: order.clusterTruckId ? {
          number: order.clusterTruckId.truckNumber,
          costPerKm: order.clusterTruckId.costPerKm
        } : null,
        payment: order.paymentId ? {
          status: order.paymentId.status,
          escrowStatus: order.paymentId.escrowStatus,
          totalAmount: order.paymentId.totalAmount
        } : null,
        escrowStatus: order.escrowStatus
      }
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order', details: error.message });
  }
});

// ✅ GET: Get logged-in buyer's orders
router.get('/me/list', authMiddleware, roleMiddleware('buyer'), async (req, res) => {
  try {
    const buyer = await Buyer.findOne({ userId: req.user.userId });
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer profile not found' });
    }

    const { status, limit = 50, offset = 0 } = req.query;

    const query = { buyerId: buyer._id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate({
        path: 'cropId',
        populate: { path: 'farmerId', select: 'name village ratingScore' }
      })
      .populate('paymentId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Order.countDocuments(query);

    res.json({
      orders: orders.map(o => ({
        id: o._id,
        status: o.status,
        crop: o.cropId ? {
          id: o.cropId._id,
          type: o.cropId.cropType,
          quantity: o.quantity,
          farmerName: o.cropId.farmerId?.name,
          farmerVillage: o.cropId.farmerId?.village
        } : null,
        pricing: {
          priceOffered: o.priceOffered,
          totalAmount: o.priceBreakdown?.totalAmount
        },
        delivery: {
          type: o.deliveryType,
          date: o.deliveryDate,
          confirmed: o.deliveryConfirmed
        },
        payment: o.paymentId ? {
          status: o.paymentId.status,
          escrowStatus: o.paymentId.escrowStatus,
          totalAmount: o.paymentId.totalAmount
        } : null,
        escrowStatus: o.escrowStatus,
        createdAt: o.createdAt
      })),
      count: orders.length,
      total
    });
  } catch (error) {
    console.error('Get buyer orders error:', error);
    res.status(500).json({ error: 'Failed to fetch buyer orders', details: error.message });
  }
});

// ✅ GET: Get all orders (Admin)
router.get('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const query = {};
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('cropId', 'cropType quantity')
      .populate('buyerId', 'name')
      .populate({
        path: 'cropId',
        populate: { path: 'farmerId', select: 'name' }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Order.countDocuments(query);

    res.json({
      orders: orders.map(o => ({
        id: o._id,
        cropType: o.cropId.cropType,
        farmerName: o.cropId.farmerId.name,
        buyerName: o.buyerId.name,
        quantity: o.quantity,
        status: o.status,
        escrowStatus: o.escrowStatus,
        price: o.priceOffered,
        createdAt: o.createdAt
      })),
      count: orders.length,
      total
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
});

module.exports = router;
