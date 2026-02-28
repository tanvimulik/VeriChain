const { runClustering } = require('../services/clusteringService');
const Cluster = require('../models/Cluster');
const Order = require('../models/Order');

// Manually trigger clustering
exports.triggerClustering = async (req, res) => {
  try {
    console.log('🔄 Manual clustering triggered');
    const result = await runClustering();
    
    res.json({
      success: result.success,
      message: result.message,
      clustersCreated: result.clustersCreated,
    });
  } catch (error) {
    console.error('❌ Clustering trigger error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all clusters
exports.getAllClusters = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const clusters = await Cluster.find(filter)
      .populate('assignedTruckId', 'fullName truckNumber phone')
      .populate('orders')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: clusters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get cluster by ID
exports.getClusterById = async (req, res) => {
  try {
    const cluster = await Cluster.findById(req.params.id)
      .populate('assignedTruckId')
      .populate('orders')
      .populate('pickups.farmerId', 'fullName phone')
      .populate('deliveries.buyerId', 'businessName phone');

    if (!cluster) {
      return res.status(404).json({
        success: false,
        message: 'Cluster not found',
      });
    }

    res.json({
      success: true,
      data: cluster,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get clustering statistics
exports.getClusteringStats = async (req, res) => {
  try {
    const totalClusters = await Cluster.countDocuments();
    const activeClusters = await Cluster.countDocuments({ status: { $in: ['Assigned', 'InProgress'] } });
    const completedClusters = await Cluster.countDocuments({ status: 'Completed' });
    
    const pendingOrders = await Order.countDocuments({
      requestStatus: 'accepted',
      assignedTruckId: null,
    });

    res.json({
      success: true,
      data: {
        totalClusters,
        activeClusters,
        completedClusters,
        pendingOrders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = exports;
