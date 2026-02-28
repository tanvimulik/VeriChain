const Order = require('../models/Order');
const Crop = require('../models/Crop');
const crypto = require('crypto');

// Create Order Request (Buyer sends request to farmer)
exports.createOrderRequest = async (req, res) => {
  try {
    const { cropId, quantity, deliveryType, buyerNotes, deliveryAddress, deliveryCoordinates } = req.body;
    const buyerId = req.user.id;

    // Fetch buyer details
    const Buyer = require('../models/Buyer');
    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({ message: 'Buyer not found' });
    }

    // Verify crop exists and is available
    const crop = await Crop.findById(cropId).populate('farmerId');
    if (!crop || crop.listingStatus !== 'active') {
      return res.status(400).json({ message: 'Crop not available' });
    }

    // Check if buyer has enough quantity requested
    if (quantity > crop.quantity) {
      return res.status(400).json({ message: 'Requested quantity exceeds available quantity' });
    }

    // Generate Order ID
    const orderId = 'ORD' + Date.now().toString().slice(-8);

    // Calculate pricing
    const pricePerUnit = crop.pricePerUnit;
    const farmerPrice = pricePerUnit * quantity;
    const transportCost = Math.round(quantity * 0.5); // ₹0.5 per kg
    const platformFee = Math.round((farmerPrice + transportCost) * 0.03); // 3%
    const totalAmount = farmerPrice + transportCost + platformFee;

    const order = new Order({
      orderId,
      buyerId,
      buyerName: buyer.name,
      buyerPhone: buyer.phone,
      deliveryAddress: deliveryAddress || buyer.address,
      deliveryCoordinates: deliveryCoordinates || null,
      farmerId: crop.farmerId._id,
      farmerName: crop.farmerName,
      farmerPhone: crop.farmerId.phone,
      cropId,
      cropType: crop.cropName,
      quantity,
      unit: crop.unit,
      pricePerUnit,
      farmerPrice,
      transportCost,
      platformFee,
      totalAmount,
      deliveryType: 'buyer_address',
      buyerNotes,
      requestStatus: 'pending_farmer_approval',
      orderStatus: 'pending_farmer_approval',
      paymentStatus: 'pending',
    });

    await order.save();

    console.log('✅ Order created successfully:', {
      orderId: order.orderId,
      _id: order._id,
      buyerName: order.buyerName,
      farmerName: order.farmerName,
      cropType: order.cropType,
      quantity: order.quantity,
      totalAmount: order.totalAmount
    });

    res.status(201).json({
      success: true,
      message: 'Order request sent to farmer',
      data: order,
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Farmer accepts order request
exports.acceptOrderRequest = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { responseMessage } = req.body;
    const farmerId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify farmer owns this order
    if (order.farmerId.toString() !== farmerId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (order.requestStatus !== 'pending_farmer_approval') {
      return res.status(400).json({ message: 'Order already processed' });
    }

    // Update order status
    order.requestStatus = 'accepted';
    order.orderStatus = 'payment_pending';
    order.farmerResponseMessage = responseMessage || 'Order accepted';
    order.farmerResponseDate = new Date();

    await order.save();

    res.json({
      success: true,
      message: 'Order request accepted',
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Farmer rejects order request
exports.rejectOrderRequest = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { responseMessage } = req.body;
    const farmerId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify farmer owns this order
    if (order.farmerId.toString() !== farmerId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (order.requestStatus !== 'pending_farmer_approval') {
      return res.status(400).json({ message: 'Order already processed' });
    }

    // Update order status
    order.requestStatus = 'farmer_rejected';
    order.orderStatus = 'farmer_rejected';
    order.farmerResponseMessage = responseMessage || 'Order rejected';
    order.farmerResponseDate = new Date();

    await order.save();

    res.json({
      success: true,
      message: 'Order request rejected',
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Process UPI Payment
exports.processUPIPayment = async (req, res) => {
  try {
    const { orderId, transactionId, amount } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validate amount matches
    if (amount !== order.totalAmount) {
      return res.status(400).json({ message: 'Amount mismatch' });
    }

    // Update payment status
    order.paymentStatus = 'paid';
    order.escrowStatus = 'funded';
    order.orderStatus = 'paid';
    order.transactionId = transactionId;
    await order.save();

    res.json({
      message: 'Payment successful',
      order,
      status: 'success',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Buyer's Pending Requests (waiting for farmer approval)
exports.getBuyerPendingRequests = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const orders = await Order.find({ 
      buyerId,
      requestStatus: 'pending_farmer_approval'
    })
      .populate('farmerId')
      .populate('cropId')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Buyer's Accepted Orders (farmer accepted, ready for payment)
exports.getBuyerAcceptedOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const orders = await Order.find({ 
      buyerId,
      requestStatus: 'accepted',
      paymentStatus: 'pending'
    })
      .populate('farmerId')
      .populate('cropId')
      .sort({ farmerResponseDate: -1 });
    
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Buyer Orders (all orders)
exports.getBuyerOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const orders = await Order.find({ buyerId })
      .populate('farmerId')
      .populate('cropId')
      .populate('assignedTruckId')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Farmer Orders
exports.getFarmerOrders = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const orders = await Order.find({ farmerId })
      .populate('buyerId')
      .populate('cropId')
      .populate('assignedTruckId');
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Release Payment (After Delivery)
exports.releasePayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.orderStatus !== 'delivered') {
      return res.status(400).json({ message: 'Order not delivered yet' });
    }

    // Calculate splits
    const farmerAmount = order.farmerPrice;
    const truckAmount = order.transportCost;
    const fpoAmount = order.fpoStorageCost;
    const platformAmount = order.platformFee;

    order.escrowStatus = 'released';
    order.orderStatus = 'payment_released';
    await order.save();

    res.json({
      message: 'Payment released successfully',
      splits: {
        farmer: farmerAmount,
        truck: truckAmount,
        fpo: fpoAmount,
        platform: platformAmount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Order Details
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    console.log('=== GET ORDER DETAILS DEBUG ===');
    console.log('Received orderId:', orderId);
    console.log('OrderId type:', typeof orderId);
    console.log('OrderId length:', orderId?.length);
    console.log('User:', req.user);
    
    // Try to find by MongoDB _id first
    let order = await Order.findById(orderId)
      .populate('buyerId')
      .populate('farmerId')
      .populate('cropId')
      .populate('assignedTruckId')
     

    console.log('Found by _id:', order ? 'YES' : 'NO');
    if (order) {
      console.log('Order details:', {
        _id: order._id,
        orderId: order.orderId,
        buyerName: order.buyerName,
        farmerName: order.farmerName,
        cropType: order.cropType,
        paymentStatus: order.paymentStatus
      });
    }

    if (!order) {
      // If not found by _id, try by orderId string
      order = await Order.findOne({ orderId })
        .populate('buyerId')
        .populate('farmerId')
        .populate('cropId')
        .populate('assignedTruckId')
       
      
      console.log('Found by orderId string:', order ? 'YES' : 'NO');
    }

    if (!order) {
      console.log('❌ Order not found in database');
      console.log('Searching for recent orders to debug...');
      const recentOrders = await Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('_id orderId cropType buyerName farmerName createdAt');
      console.log('Recent orders in database:', recentOrders);
      console.log('==============================');
      
      return res.status(404).json({ 
        success: false,
        message: 'Order not found',
        debug: {
          searchedId: orderId,
          recentOrders: recentOrders.map(o => ({
            _id: o._id.toString(),
            orderId: o.orderId,
            cropType: o.cropType
          }))
        }
      });
    }

    console.log('✅ Order found successfully');
    console.log('==============================');

    res.json({ 
      success: true,
      data: order 
    });
  } catch (error) {
    console.error('❌ Error fetching order details:', error);
    console.log('==============================');
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = status;
    await order.save();

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
