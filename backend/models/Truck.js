const mongoose = require('mongoose');

const TruckSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    truckNumber: {
      type: String,
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      required: true,
      enum: ['Tata Ace', 'Pickup', 'Mini Truck', 'Medium Truck', 'Large Truck'],
    },
    capacity: {
      type: Number,
      required: true, // in kg
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    status: {
      type: String,
      enum: ['Offline', 'Available', 'Assigned', 'OnRoute', 'Delivering', 'Completed'],
      default: 'Offline',
    },
    currentLoad: {
      type: Number,
      default: 0, // in kg
    },
    activeClusterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cluster',
      default: null,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    totalTrips: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Truck', TruckSchema);
