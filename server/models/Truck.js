const mongoose = require('mongoose');

const truckSchema = new mongoose.Schema({
  logisticsOrgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LogisticsOrg',
    required: true
  },
  truckNumber: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
    trim: true
  },
  truckType: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 0
  },
  costPerKm: {
    type: Number,
    required: true,
    min: 0
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  currentLatitude: Number,
  currentLongitude: Number,
  status: {
    type: String,
    enum: ['available', 'assigned', 'in_transit', 'maintenance'],
    default: 'available'
  }
}, {
  timestamps: true
});

truckSchema.index({ currentLocation: '2dsphere' });
truckSchema.index({ logisticsOrgId: 1 });
truckSchema.index({ status: 1 });
// truckNumber is already indexed via unique: true

module.exports = mongoose.model('Truck', truckSchema);
