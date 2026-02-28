const mongoose = require('mongoose');

const StorageRequestSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true,
    },
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
    },
    fpoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FPOStorage',
      required: true,
    },
    cropName: String,
    storedQuantity: Number,
    storageType: {
      type: String,
      enum: ['Cold', 'Dry'],
    },
    storageStartDate: {
      type: Date,
      default: Date.now,
    },
    storageEndDate: Date,
    storageCharges: {
      type: Number,
      default: 0,
    },
    approvalStatus: {
      type: String,
      default: 'pending',
      enum: ['pending', 'approved', 'rejected', 'released'],
    },
    daysStored: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StorageRequest', StorageRequestSchema);
