const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema({
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
  buyerType: {
    type: String,
    required: true,
    enum: ['kirana', 'hotel', 'catering', 'institutional', 'retailer', 'wholesaler', 'other']
  },
  businessName: {
    type: String,
    trim: true
  },
  gstin: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  deliveryAddress: {
    type: String,
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
      default: [0, 0]
    }
  },
  latitude: Number,
  longitude: Number,
  verified: {
    type: Boolean,
    default: false
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
  repeatOrders: {
    type: Number,
    default: 0
  },
  profileImage: String,
  bankDetails: {
    accountHolder: String,
    accountNumber: String,
    ifsc: String,
    bankName: String
  },
  deactivated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Geospatial index
buyerSchema.index({ location: '2dsphere' });
buyerSchema.index({ userId: 1 });
buyerSchema.index({ buyerType: 1 });

module.exports = mongoose.model('Buyer', buyerSchema);
