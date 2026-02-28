const mongoose = require('mongoose');

const FarmerSchema = new mongoose.Schema(
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
    aadhaar: {
      type: String,
      required: true,
      unique: true,
    },
    village: {
      type: String,
      required: true,
    },
    farmSize: {
      type: String,
      required: true,
      enum: ['< 1 acre', '1-2 acres', '2-5 acres', '5-10 acres', '> 10 acres'],
    },
    cropsGrown: [String],
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
    },
    languagePreference: {
      type: String,
      default: 'English',
      enum: ['English', 'Hindi', 'Marathi'],
    },
    gpsLocation: {
      latitude: Number,
      longitude: Number,
    },
    verificationStatus: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Verified', 'Rejected'],
    },
    verifiedBadge: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Farmer', FarmerSchema);
