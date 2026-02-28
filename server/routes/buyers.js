const express = require('express');
const router = express.Router();
const { Buyer, Order, Crop, Farmer, User } = require('../models');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Get buyer profile
router.get('/profile', authMiddleware, roleMiddleware('buyer'), async (req, res) => {
  try {
    const buyer = await Buyer.findOne({ userId: req.user.userId })
      .populate('userId', 'phone email');

    if (!buyer) {
      return res.status(404).json({ error: 'Buyer profile not found' });
    }

    res.json({ buyer });
  } catch (error) {
    console.error('Get buyer profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Search crops
router.get('/search-crops', authMiddleware, roleMiddleware('buyer'), async (req, res) => {
  try {
    const { crop_type, cropType, min_quantity, minQuantity, max_price, maxPrice, location } = req.query;

    const query = { status: 'available' };

    if (crop_type || cropType) {
      query.cropType = new RegExp(crop_type || cropType, 'i');
    }

    if (min_quantity || minQuantity) {
      query.quantity = { $gte: parseInt(min_quantity || minQuantity) };
    }

    const crops = await Crop.find(query)
      .populate({
        path: 'farmerId',
        select: 'name village latitude longitude ratingScore'
      })
      .sort({ createdAt: -1 })
      .limit(50);

    // Transform to match old API format
    const transformedCrops = crops.map(crop => ({
      ...crop.toObject(),
      farmer_name: crop.farmerId?.name,
      village: crop.farmerId?.village,
      latitude: crop.farmerId?.latitude,
      longitude: crop.farmerId?.longitude,
      farmer_rating: crop.farmerId?.ratingScore
    }));

    res.json({ crops: transformedCrops });

  } catch (error) {
    console.error('Search crops error:', error);
    res.status(500).json({ error: 'Failed to search crops' });
  }
});

// Get buyer's orders
router.get('/orders', authMiddleware, roleMiddleware('buyer'), async (req, res) => {
  try {
    const buyer = await Buyer.findOne({ userId: req.user.userId });

    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    const orders = await Order.find({ buyerId: buyer._id })
      .populate({
        path: 'cropId',
        populate: {
          path: 'farmerId',
          select: 'name village'
        }
      })
      .sort({ createdAt: -1 });

    // Transform to match old API format
    const transformedOrders = orders.map(order => ({
      ...order.toObject(),
      crop_type: order.cropId?.cropType,
      crop_quantity: order.cropId?.quantity,
      farmer_name: order.cropId?.farmerId?.name,
      village: order.cropId?.farmerId?.village
    }));

    res.json({ orders: transformedOrders });

  } catch (error) {
    console.error('Get buyer orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;
