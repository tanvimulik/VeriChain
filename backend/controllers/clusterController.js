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

// Debug endpoint to check orders ready for clustering
exports.debugOrders = async (req, res) => {
  try {
    const allOrders = await Order.find({})
      .select('orderId requestStatus assignedTruckId pickupCoordinates deliveryCoordinates cropType quantity')
      .sort({ createdAt: -1 })
      .limit(10);

    const acceptedOrders = await Order.find({ requestStatus: 'accepted' })
      .select('orderId requestStatus assignedTruckId pickupCoordinates deliveryCoordinates cropType quantity');

    const readyForClustering = await Order.find({
      requestStatus: 'accepted',
      assignedTruckId: null,
      pickupCoordinates: { $exists: true, $ne: null },
      deliveryCoordinates: { $exists: true, $ne: null },
    }).select('orderId requestStatus pickupCoordinates deliveryCoordinates cropType quantity');

    res.json({
      success: true,
      data: {
        totalOrders: allOrders.length,
        recentOrders: allOrders,
        acceptedOrders: acceptedOrders.length,
        acceptedOrdersList: acceptedOrders,
        readyForClustering: readyForClustering.length,
        readyForClusteringList: readyForClustering,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Debug endpoint to verify route optimization
exports.debugRouteOptimization = async (req, res) => {
  try {
    const { clusterId } = req.params;
    const { calculateDistance } = require('../services/clusteringService');
    
    const cluster = await Cluster.findById(clusterId)
      .populate('assignedTruckId')
      .populate({
        path: 'orders',
        populate: [
          { path: 'buyerId', select: 'businessName phone' },
          { path: 'farmerId', select: 'fullName phone' }
        ]
      });

    if (!cluster) {
      return res.status(404).json({ 
        success: false,
        message: 'Cluster not found' 
      });
    }

    // Calculate distances between consecutive stops
    const pickupRoute = cluster.pickups.map((pickup, idx) => {
      let distanceFromPrevious = 0;
      let previousLocation = '';
      
      if (idx === 0) {
        // Distance from truck to first pickup
        const truckCoords = cluster.assignedTruckId?.coordinates || cluster.centerCoordinates;
        distanceFromPrevious = calculateDistance(
          truckCoords.latitude,
          truckCoords.longitude,
          pickup.coordinates.latitude,
          pickup.coordinates.longitude
        );
        previousLocation = 'Truck Start Location';
      } else {
        // Distance from previous pickup
        distanceFromPrevious = calculateDistance(
          cluster.pickups[idx - 1].coordinates.latitude,
          cluster.pickups[idx - 1].coordinates.longitude,
          pickup.coordinates.latitude,
          pickup.coordinates.longitude
        );
        previousLocation = `Pickup ${idx}`;
      }
      
      return {
        sequence: pickup.sequence,
        farmerId: pickup.farmerId,
        address: pickup.address,
        coordinates: pickup.coordinates,
        quantity: `${pickup.quantity} kg`,
        distanceFromPrevious: `${distanceFromPrevious.toFixed(2)} km`,
        previousLocation
      };
    });
    
    const deliveryRoute = cluster.deliveries.map((delivery, idx) => {
      let distanceFromPrevious = 0;
      let previousLocation = '';
      
      if (idx === 0) {
        // Distance from last pickup to first delivery
        if (cluster.pickups.length > 0) {
          const lastPickup = cluster.pickups[cluster.pickups.length - 1];
          distanceFromPrevious = calculateDistance(
            lastPickup.coordinates.latitude,
            lastPickup.coordinates.longitude,
            delivery.coordinates.latitude,
            delivery.coordinates.longitude
          );
          previousLocation = `Last Pickup (Farmer)`;
        }
      } else {
        // Distance from previous delivery
        distanceFromPrevious = calculateDistance(
          cluster.deliveries[idx - 1].coordinates.latitude,
          cluster.deliveries[idx - 1].coordinates.longitude,
          delivery.coordinates.latitude,
          delivery.coordinates.longitude
        );
        previousLocation = `Delivery ${idx} (Buyer ${idx})`;
      }
      
      return {
        sequence: delivery.sequence,
        buyerId: delivery.buyerId,
        address: delivery.address,
        coordinates: delivery.coordinates,
        quantity: `${delivery.quantity} kg`,
        distanceFromPrevious: `${distanceFromPrevious.toFixed(2)} km`,
        previousLocation
      };
    });

    const routeAnalysis = {
      clusterId: cluster._id,
      truckNumber: cluster.assignedTruckId?.truckNumber,
      truckLocation: cluster.assignedTruckId?.coordinates,
      status: cluster.status,
      
      summary: {
        totalWeight: `${cluster.totalWeight} kg`,
        totalDistance: `${cluster.totalDistance} km`,
        estimatedTime: `${cluster.estimatedTime} minutes (${(cluster.estimatedTime / 60).toFixed(1)} hours)`,
        earning: `₹${cluster.earning}`,
        totalPickups: cluster.pickups.length,
        totalDeliveries: cluster.deliveries.length,
      },
      
      pickupRoute: pickupRoute,
      deliveryRoute: deliveryRoute,
      
      optimization: {
        method: 'Nearest Neighbor Algorithm',
        description: 'Each delivery stop is chosen based on proximity to the previous location',
        note: 'The sequence field shows the optimized order (0 = first, 1 = second, etc.)',
        proof: 'Compare the sequence numbers with distances - closer stops have lower sequence numbers'
      }
    };

    res.json({
      success: true,
      data: routeAnalysis
    });

  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = exports;
