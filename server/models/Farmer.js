const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  village: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  farmType: {
    type: String,
    trim: true
  },
  farmSize: {
    type: Number,
    description: 'Farm size in acres'
  },
  aadhaarNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  location: {
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
  latitude: Number,
  longitude: Number,
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationDate: Date,
  ratingScore: {
    type: Number,
    default: 0.0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  successfulDeliveries: {
    type: Number,
    default: 0
  },
  trustBadge: {
    type: Boolean,
    default: false,
    description: 'Verified farmer badge'
  },
  profileImage: String,
  bankDetails: {
    accountHolder: String,
    accountNumber: String,
    ifsc: String,
    bankName: String
  },
  aadharVerified: {
    type: Boolean,
    default: false
  },
  deactivated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Geospatial index for location-based queries
farmerSchema.index({ location: '2dsphere' });
farmerSchema.index({ userId: 1 });
farmerSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('Farmer', farmerSchema);
