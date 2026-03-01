const Crop = require('../models/Crop');
const Order = require('../models/Order');
const Truck = require('../models/Truck');
const StorageRequest = require('../models/StorageRequest');
const Payment = require('../models/Payment');
const Rating = require('../models/Rating');
const Notification = require('../models/Notification');
const Farmer = require('../models/Farmer');

// Get Farmer Profile
exports.getProfile = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.user.id).select('-password');
    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }
    res.json({ success: true, data: farmer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Create/List New Crop
exports.createCrop = async (req, res) => {
  try {
    const cropData = {
      ...req.body,
      farmerId: req.user.id,
      farmerName: req.user.fullName,
      farmerPhone: req.user.phone,
      farmerLocation: req.user.village,
    };

    const crop = await Crop.create(cropData);
    res.status(201).json({ success: true, data: crop });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get My Listings
exports.getMyListings = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { farmerId: req.user.id };
    
    if (status) {
      filter.listingStatus = status;
    }

    const crops = await Crop.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: crops });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update Crop
exports.updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    res.json({ success: true, data: crop });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete Crop
exports.deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findOneAndDelete({
      _id: req.params.id,
      farmerId: req.user.id,
    });

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    res.json({ success: true, message: 'Crop deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get Incoming Orders
exports.getIncomingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 
  farmerId: req.user.id,
  requestStatus: 'pending_farmer_approval'
})
  .populate('buyerId', 'businessName phone rating deliveryAddress')
  .populate('cropId', 'cropName category quantity unit pricePerUnit')
  .sort({ createdAt: -1 });


    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Accept Order
exports.acceptOrder = async (req, res) => {
  try {
    const { pickupAddress, pickupCoordinates, responseMessage } = req.body;
    
    const order = await Order.findOne({ 
      _id: req.params.id, 
      farmerId: req.user.id,
      requestStatus: 'pending_farmer_approval'
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or already processed' });
    }

    // Use farmer's registered GPS location if pickupCoordinates not provided
    let finalPickupCoordinates = pickupCoordinates;
    if (!finalPickupCoordinates && req.user.gpsLocation && req.user.gpsLocation.latitude && req.user.gpsLocation.longitude) {
      finalPickupCoordinates = {
        latitude: req.user.gpsLocation.latitude,
        longitude: req.user.gpsLocation.longitude
      };
      console.log('✅ Using farmer registered GPS location:', finalPickupCoordinates);
    }

    // Update order with pickup details
    order.requestStatus = 'accepted';
    order.orderStatus = 'payment_pending';
    order.pickupAddress = pickupAddress || req.user.address;
    order.pickupCoordinates = finalPickupCoordinates;
    order.farmerResponseMessage = responseMessage || 'Order accepted';
    order.farmerResponseDate = new Date();

    await order.save();

    // Create notification for buyer
    await Notification.create({
      userId: order.buyerId,
      userType: 'Buyer',
      type: 'order_accepted',
      message: `Your order request has been accepted by the farmer. Please proceed with payment.`,
      relatedId: order._id,
    });

    // Trigger clustering if both coordinates are available
    if (order.pickupCoordinates && order.deliveryCoordinates) {
      console.log('🔄 Triggering clustering for order:', order.orderId);
      const { runClustering } = require('../services/clusteringService');
      // Run clustering asynchronously (don't wait for it)
      runClustering().catch(err => console.error('Clustering error:', err));
    }

    res.json({ success: true, data: order, message: 'Order accepted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Reject Order
exports.rejectOrder = async (req, res) => {
  try {
    const { responseMessage } = req.body;
    
    const order = await Order.findOne({
      _id: req.params.id,
      farmerId: req.user.id,
      requestStatus: 'pending_farmer_approval'
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or already processed' });
    }

    order.requestStatus = 'farmer_rejected';
    order.orderStatus = 'farmer_rejected';
    order.farmerResponseMessage = responseMessage || 'Order rejected';
    order.farmerResponseDate = new Date();
    await order.save();

    // Create notification for buyer
    await Notification.create({
      userId: order.buyerId,
      userType: 'Buyer',
      type: 'order_rejected',
      message: `Your order request has been rejected by the farmer.`,
      relatedId: order._id,
    });

    res.json({ success: true, data: order, message: 'Order rejected' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get Assigned Trucks
exports.getAssignedTrucks = async (req, res) => {
  try {
    const trucks = await Truck.find({ farmerId: req.user.id })
      .populate('orderId')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: trucks });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get My Storage
exports.getMyStorage = async (req, res) => {
  try {
    const storage = await StorageRequest.find({ farmerId: req.user.id })
      .populate('fpoId', 'name storageType capacity')
      .populate('cropId', 'cropName')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: storage });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Request Storage Extension
exports.requestStorageExtension = async (req, res) => {
  try {
    const { storageId, extensionDays } = req.body;
    
    const storage = await StorageRequest.findOneAndUpdate(
      { _id: storageId, farmerId: req.user.id },
      { $inc: { daysStored: extensionDays } },
      { new: true }
    );

    if (!storage) {
      return res.status(404).json({ success: false, message: 'Storage not found' });
    }

    res.json({ success: true, data: storage });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get My Payments
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ farmerId: req.user.id })
      .populate('orderId')
      .populate('buyerId', 'fullName')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get My Ratings
exports.getMyRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ farmerId: req.user.id })
      .populate('buyerId', 'fullName')
      .sort({ createdAt: -1 });

    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    res.json({
      success: true,
      data: {
        averageRating: avgRating.toFixed(1),
        totalReviews: ratings.length,
        ratings,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Respond to Rating
exports.respondToRating = async (req, res) => {
  try {
    const { response } = req.body;
    
    const rating = await Rating.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user.id },
      { farmerResponse: response },
      { new: true }
    );

    if (!rating) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }

    res.json({ success: true, data: rating });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get My Notifications
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.id,
      userType: 'Farmer',
    }).sort({ createdAt: -1 }).limit(50);

    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Mark Notification as Read
exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
