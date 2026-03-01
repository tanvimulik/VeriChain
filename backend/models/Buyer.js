const mongoose = require('mongoose');

const BuyerSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
    },
    businessType: {
      type: String,
      required: true,
      enum: ['Kirana', 'Hotel', 'Catering', 'Institutional'],
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    gst: String,
    deliveryAddress: {
      type: String,
      required: true,
    },
    city: String,
    state: String,
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

module.exports = mongoose.model('Buyer', BuyerSchema);
