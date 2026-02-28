const mongoose = require('mongoose');

const fpoStorageSchema = new mongoose.Schema({
  fpoName: {
    type: String,
    required: true,
    trim: true
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  address: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 0,
    description: 'Total capacity in kg'
  },
  availableCapacity: {
    type: Number,
    required: true,
    min: 0,
    description: 'Currently available capacity in kg'
  },
  currentUsage: {
    type: Number,
    default: 0,
    min: 0,
    description: 'Current usage in kg'
  },
  costPerKgPerDay: {
    type: Number,
    required: true,
    min: 0,
    description: 'Storage cost per kg per day in rupees'
  },
  hasColdStorage: {
    type: Boolean,
    default: false,
    description: 'Whether storage is cold (temperature controlled)'
  },
  contactPerson: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    required: true,
    trim: true
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationDate: {
    type: Date
  },
  storeItems: [{
    itemId: mongoose.Schema.Types.ObjectId,
    quantity: Number,
    storageStartDate: Date,
    expectedRemovalDate: Date,
    farmerName: String
  }]
}, {
  timestamps: true
});

// Geospatial index for location-based queries
fpoStorageSchema.index({ location: '2dsphere' });
fpoStorageSchema.index({ verificationStatus: 1 });
fpoStorageSchema.index({ adminId: 1 });

module.exports = mongoose.model('FPOStorage', fpoStorageSchema);
