const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true
  },
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  priceOffered: {
    type: Number,
    required: true,
    min: 0,
    description: 'Buyer offered price per unit'
  },
  deliveryDate: {
    type: Date
  },
  deliveryType: {
    type: String,
    enum: ['pickup', 'delivery'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  clusterTruckId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Truck'
  },
  priceBreakdown: {
    basePrice: { type: Number, description: 'Quantity × Buyer offer price' },
    transportCost: { type: Number, description: 'Distance × Truck rate / cluster size' },
    storageCost: { type: Number, description: 'Quantity × Days × FPO cost' },
    platformFee: { type: Number, description: '3% of basePrice' },
    farmerNetAmount: { type: Number, description: 'Amount farmer receives' },
    totalAmount: { type: Number, description: 'Total buyer pays' }
  },
  escrowStatus: {
    type: String,
    enum: ['pending', 'held', 'released', 'partial_release'],
    default: 'pending',
    description: 'Escrow payment status'
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  deliveryConfirmed: {
    type: Boolean,
    default: false
  },
  deliveryConfirmedDate: {
    type: Date
  },
  ratedByBuyer: {
    type: Boolean,
    default: false
  },
  ratedByFarmer: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

orderSchema.index({ buyerId: 1 });
orderSchema.index({ cropId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
