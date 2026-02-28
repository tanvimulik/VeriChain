const Farmer = require('../models/Farmer');
const Buyer = require('../models/Buyer');
const LogisticsOrg = require('../models/LogisticsOrg');
const Order = require('../models/Order');

// Approve Farmer
exports.approveFarmer = async (req, res) => {
  try {
    const { farmerId } = req.body;

    const farmer = await Farmer.findById(farmerId);
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    farmer.verificationStatus = 'Verified';
    farmer.verifiedBadge = true;
    await farmer.save();

    res.json({ message: 'Farmer approved successfully', farmer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve Buyer
exports.approveBuyer = async (req, res) => {
  try {
    const { buyerId } = req.body;

    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({ message: 'Buyer not found' });
    }

    buyer.verificationStatus = 'Verified';
    await buyer.save();

    res.json({ message: 'Buyer approved successfully', buyer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve Logistics Organization
exports.approveLogistics = async (req, res) => {
  try {
    const { logisticsId } = req.body;

    const logisticsOrg = await LogisticsOrg.findById(logisticsId);
    if (!logisticsOrg) {
      return res.status(404).json({ message: 'Logistics organization not found' });
    }

    logisticsOrg.verificationStatus = 'Verified';
    await logisticsOrg.save();

    res.json({ message: 'Logistics organization approved successfully', logisticsOrg });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Pending Farmers
exports.getPendingFarmers = async (req, res) => {
  try {
    const farmers = await Farmer.find({ verificationStatus: 'Pending' });
    res.json({ farmers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Pending Buyers
exports.getPendingBuyers = async (req, res) => {
  try {
    const buyers = await Buyer.find({ verificationStatus: 'Pending' });
    res.json({ buyers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Dashboard Analytics
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const totalFarmers = await Farmer.countDocuments();
    const totalBuyers = await Buyer.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$platformFee' } } },
    ]);

    const activeListings = await Farmer.find({ verificationStatus: 'Verified' }).countDocuments();

    res.json({
      totalFarmers,
      totalBuyers,
      totalOrders,
      platformRevenue: totalRevenue[0]?.total || 0,
      activeListings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
