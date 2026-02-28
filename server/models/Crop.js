const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  cropType: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    default: 'kg'
  },
  listingDate: {
    type: Date,
    default: Date.now
  },
  expectedSaleDate: {
    type: Date
  },
  photoUrls: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['available', 'assigned', 'picked', 'in_transit', 'delivered', 'cancelled'],
    default: 'available',
    description: 'Visible to buyers only if status = available'
  },
  mandiPrice: {
    type: Number,
    description: 'Current government mandi price per unit'
  },
  estimatedPrice: {
    type: Number,
    description: 'Farmer expected price per unit'
  },
  fpoStorageSelected: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FPOStorage',
    description: 'FPO storage selected by farmer (optional)'
  },
  storageStartDate: {
    type: Date,
    description: 'When storage starts'
  },
  storageEndDate: {
    type: Date,
    description: 'When storage ends'
  },
  storageCostPerDay: {
    type: Number,
    description: 'Storage cost per day for this crop'
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    description: 'Related order if crop is assigned'
  },
  clusterAssignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cluster',
    description: 'Assigned truck cluster'
  },
  offlineSync: {
    type: Boolean,
    default: false,
    description: 'Marked for offline sync'
  }
}, {
  timestamps: true
});

cropSchema.index({ farmerId: 1 });
cropSchema.index({ status: 1 });
cropSchema.index({ cropType: 1 });
cropSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Crop', cropSchema);
