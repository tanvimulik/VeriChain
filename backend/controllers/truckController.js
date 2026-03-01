const Truck = require('../models/Truck');
const Cluster = require('../models/Cluster');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_secret_key_here'; // Same as authController

// Register Truck
exports.registerTruck = async (req, res) => {
  try {
    const { fullName, phone, password, truckNumber, vehicleType, capacity, address, city, state, coordinates } = req.body;

    // Check if truck already exists
    const existingTruck = await Truck.findOne({ $or: [{ phone }, { truckNumber }] });
    if (existingTruck) {
      return res.status(400).json({ 
        success: false, 
        message: 'Truck with this phone number or truck number already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create truck
    const truck = await Truck.create({
      fullName,
      phone,
      password: hashedPassword,
      truckNumber,
      vehicleType,
      capacity,
      address,
      city,
      state,
      coordinates: coordinates || null,
      status: 'Offline',
    });

    res.status(201).json({
      success: true,
      message: 'Truck registered successfully',
      data: {
        id: truck._id,
        fullName: truck.fullName,
        phone: truck.phone,
        truckNumber: truck.truckNumber,
      },
    });
  } catch (error) {
    console.error('Truck registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login Truck
exports.loginTruck = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Find truck
    const truck = await Truck.findOne({ phone });
    if (!truck) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, truck.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: truck._id, role: 'truck' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: truck._id,
        fullName: truck.fullName,
        phone: truck.phone,
        truckNumber: truck.truckNumber,
        vehicleType: truck.vehicleType,
        capacity: truck.capacity,
        status: truck.status,
        totalEarnings: truck.totalEarnings,
        totalTrips: truck.totalTrips,
        rating: truck.rating,
      },
    });
  } catch (error) {
    console.error('Truck login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Truck Profile
exports.getTruckProfile = async (req, res) => {
  try {
    const truck = await Truck.findById(req.user.id).select('-password');
    if (!truck) {
      return res.status(404).json({ success: false, message: 'Truck not found' });
    }

    res.json({ success: true, data: truck });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Truck Details by ID (for buyers/farmers to see assigned truck)
exports.getTruckDetails = async (req, res) => {
  try {
    const truck = await Truck.findById(req.params.truckId).select('-password');
    if (!truck) {
      return res.status(404).json({ success: false, message: 'Truck not found' });
    }

    res.json({ success: true, data: truck });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Trucks (Admin/Debug endpoint)
exports.getAllTrucks = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const trucks = await Truck.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: trucks.length,
      data: trucks 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Truck Status by Phone (Debug endpoint - no auth required)
exports.updateTruckStatusByPhone = async (req, res) => {
  try {
    const { phone, status, coordinates } = req.body;

    if (!phone || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone and status are required' 
      });
    }

    const truck = await Truck.findOne({ phone });
    if (!truck) {
      return res.status(404).json({ success: false, message: 'Truck not found' });
    }

    truck.status = status;
    if (coordinates) {
      truck.coordinates = coordinates;
    }

    await truck.save();

    res.json({
      success: true,
      message: `Truck ${truck.truckNumber} status updated to ${status}`,
      data: {
        id: truck._id,
        truckNumber: truck.truckNumber,
        fullName: truck.fullName,
        phone: truck.phone,
        status: truck.status,
        coordinates: truck.coordinates,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Truck Status (Online/Offline/Available)
exports.updateTruckStatus = async (req, res) => {
  try {
    const { status, coordinates } = req.body;

    const truck = await Truck.findById(req.user.id);
    if (!truck) {
      return res.status(404).json({ success: false, message: 'Truck not found' });
    }

    truck.status = status;
    if (coordinates) {
      truck.coordinates = coordinates;
    }

    await truck.save();

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      data: truck,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Active Cluster (Current Assignment)
exports.getActiveCluster = async (req, res) => {
  try {
    const truck = await Truck.findById(req.user.id);
    if (!truck || !truck.activeClusterId) {
      return res.json({ success: true, data: null, message: 'No active assignment' });
    }

    const cluster = await Cluster.findById(truck.activeClusterId)
      .populate('orders')
      .populate('pickups.farmerId', 'fullName phone')
      .populate('deliveries.buyerId', 'businessName phone');

    res.json({ success: true, data: cluster });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Accept Cluster Assignment
exports.acceptCluster = async (req, res) => {
  try {
    const { clusterId } = req.body;

    const truck = await Truck.findById(req.user.id);
    if (!truck) {
      return res.status(404).json({ success: false, message: 'Truck not found' });
    }

    const cluster = await Cluster.findById(clusterId);
    if (!cluster) {
      return res.status(404).json({ success: false, message: 'Cluster not found' });
    }

    // Update truck status
    truck.status = 'OnRoute';
    await truck.save();

    // Update cluster status
    cluster.status = 'InProgress';
    await cluster.save();

    res.json({
      success: true,
      message: 'Cluster accepted',
      data: cluster,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Decline Cluster Assignment
exports.declineCluster = async (req, res) => {
  try {
    const { clusterId } = req.body;

    const truck = await Truck.findById(req.user.id);
    if (!truck) {
      return res.status(404).json({ success: false, message: 'Truck not found' });
    }

    // Reset truck
    truck.status = 'Available';
    truck.activeClusterId = null;
    truck.currentLoad = 0;
    await truck.save();

    // TODO: Reassign cluster to another truck
    const cluster = await Cluster.findById(clusterId);
    if (cluster) {
      cluster.assignedTruckId = null;
      cluster.status = 'Created';
      await cluster.save();
    }

    res.json({
      success: true,
      message: 'Cluster declined',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark Pickup Status (Arrived/Loaded)
exports.markPickupStatus = async (req, res) => {
  try {
    const { clusterId, pickupId, status } = req.body;

    const cluster = await Cluster.findById(clusterId);
    if (!cluster) {
      return res.status(404).json({ success: false, message: 'Cluster not found' });
    }

    const pickup = cluster.pickups.id(pickupId);
    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup not found' });
    }

    pickup.status = status; // 'Arrived' or 'Loaded'
    await cluster.save();

    // Update truck status if needed
    if (status === 'Loaded') {
      const truck = await Truck.findById(req.user.id);
      if (truck) {
        truck.status = 'Loading';
        await truck.save();
      }
    }

    res.json({
      success: true,
      message: `Pickup marked as ${status}`,
      data: cluster,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark Pickup Complete
exports.markPickupComplete = async (req, res) => {
  try {
    const { clusterId, pickupId } = req.body;

    const cluster = await Cluster.findById(clusterId);
    if (!cluster) {
      return res.status(404).json({ success: false, message: 'Cluster not found' });
    }

    const pickup = cluster.pickups.id(pickupId);
    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup not found' });
    }

    pickup.status = 'Picked';
    await cluster.save();

    res.json({
      success: true,
      message: 'Pickup marked as complete',
      data: cluster,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark Delivery Complete
exports.markDeliveryComplete = async (req, res) => {
  try {
    const { clusterId, deliveryId } = req.body;

    const cluster = await Cluster.findById(clusterId);
    if (!cluster) {
      return res.status(404).json({ success: false, message: 'Cluster not found' });
    }

    const delivery = cluster.deliveries.id(deliveryId);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    delivery.status = 'Delivered';
    await cluster.save();

    // Check if all deliveries are complete
    const allDelivered = cluster.deliveries.every(d => d.status === 'Delivered');
    if (allDelivered) {
      cluster.status = 'Completed';
      await cluster.save();

      // Update truck
      const truck = await Truck.findById(cluster.assignedTruckId);
      if (truck) {
        truck.status = 'Available';
        truck.currentLoad = 0;
        truck.activeClusterId = null;
        truck.totalEarnings += cluster.earning;
        truck.totalTrips += 1;
        await truck.save();
      }
    }

    res.json({
      success: true,
      message: 'Delivery marked as complete',
      data: cluster,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Trip History
exports.getTripHistory = async (req, res) => {
  try {
    const clusters = await Cluster.find({
      assignedTruckId: req.user.id,
      status: 'Completed',
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: clusters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = exports;
