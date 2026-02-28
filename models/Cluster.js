const mongoose = require('mongoose');

const ClusterSchema = new mongoose.Schema(
  {
    assignedTruckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Truck',
      required: true,
    },
    orders: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    }],
    pickups: [{
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
      farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
      address: String,
      quantity: Number,
      status: {
        type: String,
        enum: ['Pending', 'Picked'],
        default: 'Pending',
      },
      sequence: Number, // Order in route
    }],
    deliveries: [{
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
      buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Buyer',
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
      address: String,
      quantity: Number,
      status: {
        type: String,
        enum: ['Pending', 'Delivered'],
        default: 'Pending',
      },
      sequence: Number, // Order in route
    }],
    totalWeight: {
      type: Number,
      required: true,
    },
    earning: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Created', 'Assigned', 'InProgress', 'Completed', 'Cancelled'],
      default: 'Created',
    },
    centerCoordinates: {
      latitude: Number,
      longitude: Number,
    },
    totalDistance: {
      type: Number,
      default: 0, // in km
    },
    estimatedTime: {
      type: Number,
      default: 0, // in minutes
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cluster', ClusterSchema);
