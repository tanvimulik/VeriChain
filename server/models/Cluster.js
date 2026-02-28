const mongoose = require('mongoose');

const clusterSchema = new mongoose.Schema({
  truckId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Truck',
    required: true
  },
  hubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hub'
  },
  totalWeight: {
    type: Number,
    default: 0
  },
  estimatedPickupTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['forming', 'assigned', 'in_transit', 'completed'],
    default: 'forming'
  }
}, {
  timestamps: true
});

clusterSchema.index({ truckId: 1 });
clusterSchema.index({ status: 1 });

module.exports = mongoose.model('Cluster', clusterSchema);
