const mongoose = require('mongoose');

const logisticsOrgSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orgName: {
    type: String,
    required: true,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  totalTrucks: {
    type: Number,
    default: 0
  },
  serviceAreas: [{
    type: String,
    trim: true
  }],
  verified: {
    type: Boolean,
    default: false
  },
  ratingScore: {
    type: Number,
    default: 0.0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

logisticsOrgSchema.index({ userId: 1 });
logisticsOrgSchema.index({ verified: 1 });

module.exports = mongoose.model('LogisticsOrg', logisticsOrgSchema);
