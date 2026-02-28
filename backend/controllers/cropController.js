const Crop = require('../models/Crop');
const Order = require('../models/Order');

// List Crop (Farmer)
exports.listCrop = async (req, res) => {
  try {
    const { cropType, quantity, expectedHarvestDate, farmerAskingPrice } = req.body;
    const farmerId = req.user.id;

    const crop = new Crop({
      farmerId,
      cropType,
      quantity,
      expectedHarvestDate,
      farmerAskingPrice,
      status: 'available',
    });

    await crop.save();
    res.status(201).json({ message: 'Crop listed successfully', crop });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Available Crops (For Buyer Marketplace)
exports.getAvailableCrops = async (req, res) => {
  try {
    const { category, state, district, organicOnly, minPrice, maxPrice, sortBy } = req.query;
    
    let query = { listingStatus: 'active' };
    
    // Apply filters
    if (category) query.category = category;
    if (state) query.state = state;
    if (district) query.district = district;
    if (organicOnly === 'true') query.isOrganic = true;
    if (minPrice) query.pricePerUnit = { $gte: parseFloat(minPrice) };
    if (maxPrice) query.pricePerUnit = { ...query.pricePerUnit, $lte: parseFloat(maxPrice) };
    
    let crops = await Crop.find(query).populate('farmerId', 'fullName phone rating location');
    
    // Apply sorting
    if (sortBy === 'price-low') {
      crops.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
    } else if (sortBy === 'price-high') {
      crops.sort((a, b) => b.pricePerUnit - a.pricePerUnit);
    } else if (sortBy === 'rating') {
      crops.sort((a, b) => (b.farmerId?.rating || 0) - (a.farmerId?.rating || 0));
    }
    
    res.json({ success: true, data: crops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Farmer's Listings
exports.getFarmerListings = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const crops = await Crop.find({ farmerId });
    res.json({ crops });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Crop Details
exports.getCropDetails = async (req, res) => {
  try {
    const { cropId } = req.params;
    const crop = await Crop.findById(cropId).populate('farmerId');
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }
    res.json({ crop });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search Crops
exports.searchCrops = async (req, res) => {
  try {
    const { cropType, location, quantity } = req.query;
    let query = { status: 'available' };

    if (cropType) {
      query.cropType = { $regex: cropType, $options: 'i' };
    }

    if (quantity) {
      query.quantity = { $gte: quantity };
    }

    const crops = await Crop.find(query).populate('farmerId');
    res.json({ crops });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
