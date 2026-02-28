const express = require('express');
const router = express.Router();
const { Farmer, User, Crop, Order, Payment, Buyer, Cluster, ClusterAssignment, Truck } = require('../models');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Get farmer profile
router.get('/profile', authMiddleware, roleMiddleware('farmer'), async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ userId: req.user.userId })
      .populate('userId', 'phone verified');

    if (!farmer) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }

    res.json({ farmer });

  } catch (error) {
    console.error('Get farmer profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get farmer dashboard stats
router.get('/dashboard', authMiddleware, roleMiddleware('farmer'), async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ userId: req.user.userId });
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    // Get active listings
    const activeListings = await Crop.countDocuments({ 
      farmerId: farmer._id, 
      status: 'available' 
    });

    // Get total earnings
    const crops = await Crop.find({ farmerId: farmer._id }).select('_id');
    const cropIds = crops.map(c => c._id);
    
    const orders = await Order.find({ cropId: { $in: cropIds } }).select('_id');
    const orderIds = orders.map(o => o._id);
    
    const payments = await Payment.find({ 
      orderId: { $in: orderIds }, 
      status: 'released' 
    });
    const totalEarnings = payments.reduce((sum, p) => sum + p.totalAmount, 0);

    // Get total deliveries
    const totalDeliveries = await Order.countDocuments({ 
      cropId: { $in: cropIds }, 
      status: 'delivered' 
    });

    // Get recent crops for display
    const recentCrops = await Crop.find({ farmerId: farmer._id })
      .sort({ createdAt: -1 })
      .limit(5);

    // Format response to match frontend expectations
    res.json({
      activeListings: activeListings,
      totalEarnings: totalEarnings || 0,
      rating: farmer.ratingScore || 0.0,
      deliveries: totalDeliveries || 0,
      farmer: {
        name: farmer.name,
        email: farmer.email,
        phone: farmer.phone
      },
      crops: recentCrops.map(crop => ({
        _id: crop._id,
        id: crop._id,
        cropType: crop.cropType,
        quantity: crop.quantity,
        estimatedPrice: crop.estimatedPrice,
        mandiPrice: crop.mandiPrice || 20,
        expectedSaleDate: crop.expectedSaleDate,
        status: crop.status,
        createdAt: crop.createdAt
      }))
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data', details: error.message });
  }
});

// Get farmer's orders
router.get('/orders', authMiddleware, roleMiddleware('farmer'), async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ userId: req.user.userId });
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    const crops = await Crop.find({ farmerId: farmer._id }).select('_id');
    const cropIds = crops.map(c => c._id);

    const orders = await Order.find({ cropId: { $in: cropIds } })
      .populate('cropId', 'cropType quantity')
      .populate('buyerId', 'name buyerType')
      .sort({ createdAt: -1 });

    // Enrich with cluster and truck info
    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      const clusterAssignment = await ClusterAssignment.findOne({ orderId: order._id })
        .populate({
          path: 'clusterId',
          populate: { path: 'truckId', select: 'truckNumber' }
        });

      return {
        ...order.toObject(),
        estimatedPickupTime: clusterAssignment?.clusterId?.estimatedPickupTime,
        truckNumber: clusterAssignment?.clusterId?.truckId?.truckNumber
      };
    }));

    res.json({ orders: enrichedOrders });

  } catch (error) {
    console.error('Get farmer orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update farmer profile
router.put('/profile', authMiddleware, roleMiddleware('farmer'), async (req, res) => {
  try {
    const { name, village, farmType, farmSize, latitude, longitude } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (village) updateData.village = village;
    if (farmType) updateData.farmType = farmType;
    if (farmSize) updateData.farmSize = farmSize;
    if (latitude) updateData.latitude = latitude;
    if (longitude) updateData.longitude = longitude;
    
    if (latitude && longitude) {
      updateData.location = {
        type: 'Point',
        coordinates: [longitude, latitude]
      };
    }

    const farmer = await Farmer.findOneAndUpdate(
      { userId: req.user.userId },
      updateData,
      { new: true }
    );

    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      farmer
    });

  } catch (error) {
    console.error('Update farmer profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
