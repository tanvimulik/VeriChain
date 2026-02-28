const mongoose = require('mongoose');

const LogisticsOrgSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: String,
    operatingRegions: [String],
    totalTrucks: {
      type: Number,
      default: 0,
    },
    verificationStatus: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Verified', 'Rejected'],
    },
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LogisticsOrg', LogisticsOrgSchema);
