const Truck = require('../models/Truck');
const Order = require('../models/Order');

// Register Truck
exports.registerTruck = async (req, res) => {
  try {
    const { truckNumber, capacity, costPerKm, operatingRegions } = req.body;
    const organizationId = req.user.id;

    const truck = new Truck({
      organizationId,
      truckNumber,
      capacity,
      costPerKm,
      operatingRegions,
    });

    await truck.save();
    res.status(201).json({ message: 'Truck registered successfully', truck });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Organization Trucks
exports.getOrgTrucks = async (req, res) => {
  try {
    const organizationId = req.user.id;
    const trucks = await Truck.find({ organizationId });
    res.json({ trucks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Assigned Orders for Truck
exports.getAssignedOrders = async (req, res) => {
  try {
    const organizationId = req.user.id;
    const trucks = await Truck.find({ organizationId }).populate('assignedOrders');
    res.json({ trucks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Truck Availability
exports.updateTruckAvailability = async (req, res) => {
  try {
    const { truckId, availability } = req.body;

    const truck = await Truck.findById(truckId);
    if (!truck) {
      return res.status(404).json({ message: 'Truck not found' });
    }

    truck.availability = availability;
    await truck.save();

    res.json({ message: 'Truck availability updated', truck });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark Delivery Complete
exports.markDeliveryComplete = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = 'delivered';
    await order.save();

    res.json({ message: 'Delivery marked as complete', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Truck Location
exports.updateTruckLocation = async (req, res) => {
  try {
    const { truckId, latitude, longitude } = req.body;

    const truck = await Truck.findById(truckId);
    if (!truck) {
      return res.status(404).json({ message: 'Truck not found' });
    }

    truck.currentLocation = { latitude, longitude };
    await truck.save();

    res.json({ message: 'Truck location updated', truck });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
