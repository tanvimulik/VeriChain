const express = require('express');
const router = express.Router();
const { Crop, Farmer, Buyer, MandiPrice, FPOStorage } = require('../models');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// ✅ GET: Search/List all available crops (Public endpoint)
router.get('/', async (req, res) => {
  try {
    const { crop_type, cropType, location, quantity_min, quantityMin, limit = 50, offset = 0 } = req.query;

    // Build query - ONLY available crops
    const query = { status: 'available' };
    
    if (crop_type || cropType) {
      query.cropType = {
        $regex: crop_type || cropType,
        $options: 'i'
      };
    }

    let crops = await Crop.find(query)
      .populate({
        path: 'farmerId',
        select: 'name village latitude longitude ratingScore trustBadge',
        populate: { path: 'userId', select: 'verified' }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    // Location-based filtering if requested
    if (location) {
      const [buyerLat, buyerLng] = location.split(',').map(Number);
      crops = crops.filter(crop => {
        const distance = calculateDistance(
          buyerLat, buyerLng,
          crop.farmerId.latitude, crop.farmerId.longitude
        );
        return distance <= 100; // Within 100km
      });
    }

    // Enrich with price breakdown
    const enrichedCrops = await Promise.all(
      crops.map(async (crop) => {
        const priceBreakdown = await calculatePriceBreakdown(crop);
        
        return {
          _id: crop._id,
          id: crop._id,
          cropType: crop.cropType,
          quantity: crop.quantity,
          mandiPrice: crop.mandiPrice,
          estimatedPrice: crop.estimatedPrice,
          farmerName: crop.farmerId.name,
          farmerRating: crop.farmerId.ratingScore,
          trustBadge: crop.farmerId.trustBadge,
          village: crop.farmerId.village,
          expectedSaleDate: crop.expectedSaleDate,
          priceBreakdown,
          listingDate: crop.createdAt,
          status: crop.status
        };
      })
    );

    res.json({
      crops: enrichedCrops,
      count: enrichedCrops.length,
      total: await Crop.countDocuments(query)
    });

  } catch (error) {
    console.error('Get crops error:', error);
    res.status(500).json({ error: 'Failed to fetch crops', details: error.message });
  }
});

// ✅ List a new crop (Farmer only) - Creates with status='available'
router.post('/', authMiddleware, roleMiddleware('farmer'), async (req, res) => {
  try {
    const { crop_type, cropType, quantity, estimated_price, estimatedPrice, expected_sale_date, expectedSaleDate, photo_urls, photoUrls } = req.body;

    // Get farmer profile
    const farmer = await Farmer.findOne({ userId: req.user.userId });
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }

    // For offline support - can draft crop
    const offlineSync = req.body.offlineSync || false;

    // Get current mandi price
    const mandiPrice = await getMandiPrice(crop_type || cropType);

    const crop = await Crop.create({
      farmerId: farmer._id,
      cropType: crop_type || cropType,
      quantity,
      estimatedPrice: estimated_price || estimatedPrice || mandiPrice,
      expectedSaleDate: expected_sale_date || expectedSaleDate,
      photoUrls: photo_urls || photoUrls || [],
      status: 'available', // ✅ Default status for immediate visibility
      mandiPrice,
      offlineSync
    });

    // ✅ Notify buyers in REAL-TIME about new available crop
    const io = req.app.get('io');
    if (io) {
      io.emit('new-crop-listed', {
        cropId: crop._id,
        cropType: crop.cropType,
        quantity: crop.quantity,
        mandiPrice: crop.mandiPrice,
        farmerName: farmer.name,
        village: farmer.village,
        status: 'available'
      });
    }

    res.status(201).json({
      message: 'Crop listed successfully - visible in marketplace',
      crop: {
        id: crop._id,
        cropType: crop.cropType,
        quantity: crop.quantity,
        status: crop.status,
        mandiPrice: crop.mandiPrice,
        estimatedPrice: crop.estimatedPrice
      }
    });

  } catch (error) {
    console.error('Crop listing error:', error);
    res.status(500).json({ error: 'Failed to list crop', details: error.message });
  }
});

// ✅ GET: Buyer Marketplace - Only 'available' crops visible
router.get('/marketplace/buyer', authMiddleware, roleMiddleware('buyer'), async (req, res) => {
  try {
    const { crop_type, cropType, location, quantity_min, quantityMin, limit = 50, offset = 0 } = req.query;

    // Build query - ONLY available crops
    const query = { status: 'available' };
    
    if (crop_type || cropType) {
      query.cropType = {
        $regex: crop_type || cropType,
        $options: 'i'
      };
    }

    let crops = await Crop.find(query)
      .populate({
        path: 'farmerId',
        select: 'name village latitude longitude ratingScore trustBadge',
        populate: { path: 'userId', select: 'verified' }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    // Location-based filtering if requested
    if (location) {
      const [buyerLat, buyerLng] = location.split(',').map(Number);
      crops = crops.filter(crop => {
        const distance = calculateDistance(
          buyerLat, buyerLng,
          crop.farmerId.latitude, crop.farmerId.longitude
        );
        return distance <= 100; // Within 100km
      });
    }

    // Enrich with price breakdown and storage options
    const enrichedCrops = await Promise.all(
      crops.map(async (crop) => {
        const priceBreakdown = await calculatePriceBreakdown(crop);
        const fpoStorages = await FPOStorage.find({
          verificationStatus: 'verified',
          availableCapacity: { $gt: 0 },
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [crop.farmerId.longitude, crop.farmerId.latitude]
              },
              $maxDistance: 50000 // 50km
            }
          }
        }).limit(3);

        return {
          id: crop._id,
          cropType: crop.cropType,
          quantity: crop.quantity,
          mandiPrice: crop.mandiPrice,
          estimatedPrice: crop.estimatedPrice,
          farmerName: crop.farmerId.name,
          farmerRating: crop.farmerId.ratingScore,
          trustBadge: crop.farmerId.trustBadge,
          village: crop.farmerId.village,
          distance: location ? calculateDistance(
            location.split(',')[0], location.split(',')[1],
            crop.farmerId.latitude, crop.farmerId.longitude
          ) : null,
          priceBreakdown,
          availableFPOStorages: fpoStorages.map(s => ({
            id: s._id,
            name: s.fpoName,
            costPerKgPerDay: s.costPerKgPerDay,
            hasColdStorage: s.hasColdStorage,
            distance: calculateDistance(
              crop.farmerId.latitude, crop.farmerId.longitude,
              s.latitude, s.longitude
            )
          })),
          listingDate: crop.createdAt
        };
      })
    );

    res.json({
      crops: enrichedCrops,
      count: enrichedCrops.length,
      total: await Crop.countDocuments(query)
    });

  } catch (error) {
    console.error('Get marketplace crops error:', error);
    res.status(500).json({ error: 'Failed to fetch marketplace', details: error.message });
  }
});

// ✅ GET: Farmer Dashboard - My Listings (all statuses visible to farmer only)
router.get('/farmer/my-listings', authMiddleware, roleMiddleware('farmer'), async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ userId: req.user.userId });
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }

    const crops = await Crop.find({ farmerId: farmer._id })
      .sort({ createdAt: -1 });

    // Enrich with order info and storage info
    const enrichedCrops = await Promise.all(
      crops.map(async (crop) => {
        const priceBreakdown = await calculatePriceBreakdown(crop);
        const storage = crop.fpoStorageSelected ? 
          await FPOStorage.findById(crop.fpoStorageSelected).select('fpoName costPerKgPerDay') : 
          null;

        return {
          id: crop._id,
          cropType: crop.cropType,
          quantity: crop.quantity,
          status: crop.status,
          mandiPrice: crop.mandiPrice,
          estimatedPrice: crop.estimatedPrice,
          listingDate: crop.createdAt,
          status_description: getStatusDescription(crop.status),
          priceBreakdown,
          storage: storage ? {
            name: storage.fpoName,
            costPerKgPerDay: storage.costPerKgPerDay
          } : null,
          orderId: crop.orderId
        };
      })
    );

    res.json({
      crops: enrichedCrops,
      stats: {
        totalListings: crops.length,
        availableCount: crops.filter(c => c.status === 'available').length,
        assignedCount: crops.filter(c => c.status === 'assigned').length,
        deliveredCount: crops.filter(c => c.status === 'delivered').length
      }
    });

  } catch (error) {
    console.error('Get farmer listings error:', error);
    res.status(500).json({ error: 'Failed to fetch listings', details: error.message });
  }
});

// ✅ GET: Get crop details by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    const crop = await Crop.findById(id)
      .populate({
        path: 'farmerId',
        select: 'name village latitude longitude ratingScore trustBadge totalOrders successfulDeliveries',
        populate: { path: 'userId', select: 'verified' }
      })
      .populate('fpoStorageSelected', 'fpoName costPerKgPerDay hasColdStorage');

    if (!crop) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    // Control visibility based on user role
    if (userRole === 'buyer' && crop.status !== 'available') {
      return res.status(403).json({ error: 'This crop is no longer available' });
    }

    const priceBreakdown = await calculatePriceBreakdown(crop);

    const response = {
      crop: {
        id: crop._id,
        cropType: crop.cropType,
        quantity: crop.quantity,
        unit: crop.unit,
        status: crop.status,
        mandiPrice: crop.mandiPrice,
        estimatedPrice: crop.estimatedPrice,
        listingDate: crop.createdAt,
        expectedSaleDate: crop.expectedSaleDate,
        photoUrls: crop.photoUrls
      },
      farmer: {
        id: crop.farmerId._id,
        name: crop.farmerId.name,
        village: crop.farmerId.village,
        rating: crop.farmerId.ratingScore,
        trustBadge: crop.farmerId.trustBadge,
        verified: crop.farmerId.userId.verified,
        totalOrders: crop.farmerId.totalOrders,
        successfulDeliveries: crop.farmerId.successfulDeliveries,
        location: {
          latitude: crop.farmerId.latitude,
          longitude: crop.farmerId.longitude
        }
      },
      priceBreakdown,
      storage: crop.fpoStorageSelected ? {
        name: crop.fpoStorageSelected.fpoName,
        costPerKgPerDay: crop.fpoStorageSelected.costPerKgPerDay,
        hasColdStorage: crop.fpoStorageSelected.hasColdStorage,
        storageStartDate: crop.storageStartDate,
        storageEndDate: crop.storageEndDate
      } : null
    };

    res.json(response);

  } catch (error) {
    console.error('Get crop error:', error);
    res.status(500).json({ error: 'Failed to fetch crop', details: error.message });
  }
});

// ✅ PUT: Update crop (Farmer)
router.put('/:id', authMiddleware, roleMiddleware('farmer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, estimated_price, estimatedPrice, expected_sale_date, expectedSaleDate, fpo_storage_id, fpoStorageId } = req.body;

    const farmer = await Farmer.findOne({ userId: req.user.userId });
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    const crop = await Crop.findById(id);
    if (!crop || crop.farmerId.toString() !== farmer._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to update this crop' });
    }

    const updateData = {};
    if (quantity) updateData.quantity = quantity;
    if (estimated_price || estimatedPrice) updateData.estimatedPrice = estimated_price || estimatedPrice;
    if (expected_sale_date || expectedSaleDate) updateData.expectedSaleDate = expected_sale_date || expectedSaleDate;
    
    // Allow updating FPO storage (optional)
    if (fpo_storage_id || fpoStorageId) {
      const fpoId = fpo_storage_id || fpoStorageId;
      const fpoStorage = await FPOStorage.findById(fpoId);
      if (!fpoStorage) {
        return res.status(404).json({ error: 'FPO storage not found' });
      }
      updateData.fpoStorageSelected = fpoId;
      updateData.storageCostPerDay = fpoStorage.costPerKgPerDay;
    }

    const updatedCrop = await Crop.findByIdAndUpdate(id, updateData, { new: true });

    res.json({
      message: 'Crop updated successfully',
      crop: {
        id: updatedCrop._id,
        cropType: updatedCrop.cropType,
        quantity: updatedCrop.quantity,
        estimatedPrice: updatedCrop.estimatedPrice,
        status: updatedCrop.status
      }
    });

  } catch (error) {
    console.error('Update crop error:', error);
    res.status(500).json({ error: 'Failed to update crop', details: error.message });
  }
});

// ✅ POST: Select FPO Storage for a crop (optional storage)
router.post('/:id/select-fpo-storage', authMiddleware, roleMiddleware('farmer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { fpo_storage_id, fpoStorageId, storage_start_date, storageStartDate, storage_end_date, storageEndDate } = req.body;

    const fpoId = fpo_storage_id || fpoStorageId;
    const startDate = storage_start_date || storageStartDate;
    const endDate = storage_end_date || storageEndDate;

    if (!fpoId || !startDate || !endDate) {
      return res.status(400).json({ error: 'FPO storage, start date, and end date are required' });
    }

    const crop = await Crop.findById(id);
    if (!crop) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    const fpoStorage = await FPOStorage. findById(fpoId);
    if (!fpoStorage) {
      return res.status(404).json({ error: 'FPO storage not found' });
    }

    // Calculate storage cost
    const storageDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const totalStorageCost = crop.quantity * storageDays * fpoStorage.costPerKgPerDay;

    const updatedCrop = await Crop.findByIdAndUpdate(id, {
      fpoStorageSelected: fpoId,
      storageStartDate: startDate,
      storageEndDate: endDate,
      storageCostPerDay: fpoStorage.costPerKgPerDay
    }, { new: true });

    res.json({
      message: 'FPO storage selected',
      crop: {
        id: updatedCrop._id,
        fpoStorage: fpoStorage.fpoName,
        storageDays,
        totalStorageCost: totalStorageCost.toFixed(2),
        costPerKgPerDay: fpoStorage.costPerKgPerDay
      }
    });

  } catch (error) {
    console.error('Select FPO storage error:', error);
    res.status(500).json({ error: 'Failed to select FPO storage', details: error.message });
  }
});

// ============ HELPER FUNCTIONS ============

// Get current mandi price
async function getMandiPrice(cropType) {
  try {
    if (!cropType) return 20;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cached = await MandiPrice.findOne({
      cropType: { $regex: cropType, $options: 'i' },
      date: { $gte: today }
    }).sort({ createdAt: -1 });

    if (cached) {
      return cached.price;
    }

    // Default mandi prices by crop type
    const defaultPrices = {
      'wheat': 2000,
      'rice': 2500,
      'tomato': 1500,
      'potato': 1200,
      'onion': 1800,
      'corn': 1800,
      'soybean': 3500,
      'cotton': 5500,
      'sugarcane': 3000,
      'milk': 4000,
      'maize': 1900
    };

    return defaultPrices[cropType.toLowerCase()] || 2000;

  } catch (error) {
    console.error('Get mandi price error:', error);
    return 2000; // Default fallback
  }
}

// Calculate price breakdown with all costs
async function calculatePriceBreakdown(crop, buyerPrice = null) {
  const mandiPrice = crop.mandiPrice || 2000;
  const buyerOffer = buyerPrice || crop.estimatedPrice || mandiPrice;
  const transportCost = parseFloat(process.env.DEFAULT_TRANSPORT_COST_PER_KM || 2);
  const platformFeePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || 3);
  
  // Storage cost is optional
  const storageCostPerDay = crop.storageCostPerDay || 0;
  const storageDays = crop.storageEndDate ? 
    Math.ceil((new Date(crop.storageEndDate) - new Date(crop.storageStartDate)) / (1000 * 60 * 60 * 24)) : 0;
  
  const totalStorageCost = crop.quantity * storageDays * storageCostPerDay;
  const platformFee = (buyerOffer * platformFeePercentage) / 100;
  
  const farmerNetAmount = buyerOffer - transportCost - (totalStorageCost / crop.quantity) - platformFee;

  return {
    mandiPrice: mandiPrice.toFixed(2),
    buyerOffer: buyerOffer.toFixed(2),
    transportCost: transportCost.toFixed(2),
    storageCost: (totalStorageCost / crop.quantity).toFixed(2), // Per kg
    totalStorageCost: totalStorageCost.toFixed(2),
    platformFee: platformFee.toFixed(2),
    farmerNetAmount: Math.max(0, farmerNetAmount).toFixed(2),
    totalAmount: (crop.quantity * buyerOffer).toFixed(2),
    comparison: buyerOffer >= mandiPrice ? 'better_than_mandi' : 'lower_than_mandi',
    currency: 'INR',
    unit: 'kg'
  };
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get status description for frontend
function getStatusDescription(status) {
  const descriptions = {
    'available': '📋 Available in marketplace',
    'assigned': '✅ Order placed - farmer to confirm',
    'picked': '🚚 Picked up by truck',
    'in_transit': '📍 In transit to buyer',
    'delivered': '✔️ Delivered successfully',
    'cancelled': '❌ Order cancelled'
  };
  return descriptions[status] || status;
}

module.exports = router;
