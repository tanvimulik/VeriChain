const mongoose = require('mongoose');

const clusterAssignmentSchema = new mongoose.Schema({
  clusterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cluster',
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  pickupSequence: {
    type: Number
  },
  distanceFromHub: {
    type: Number
  }
}, {
  timestamps: true
});

clusterAssignmentSchema.index({ clusterId: 1 });
clusterAssignmentSchema.index({ farmerId: 1 });
clusterAssignmentSchema.index({ orderId: 1 });

module.exports = mongoose.model('ClusterAssignment', clusterAssignmentSchema);
