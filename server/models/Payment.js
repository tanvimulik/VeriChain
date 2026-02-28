const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
    description: 'Total amount buyer pays'
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'upi', 'bank_transfer', 'wallet'],
    trim: true
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  escrowStatus: {
    type: String,
    enum: ['pending', 'held', 'released', 'partial_release'],
    default: 'held',
    description: 'Escrow holds money until delivery confirmation'
  },
  breakdown: {
    basePrice: { type: Number, description: 'Quantity × Buyer offer price' },
    transportCost: { type: Number, description: 'Distance × Truck rate / cluster size' },
    storageCost: { type: Number, description: 'Quantity × Days × FPO cost' },
    platformFee: { type: Number, description: '3% of basePrice' },
    farmerNetAmount: { type: Number, description: 'Amount farmer receives' },
    truckOrgNetAmount: { type: Number, description: 'Amount truck org receives' },
    fpoNetAmount: { type: Number, description: 'Amount FPO receives (if used)' }
  },
  paymentSchedule: [{
    recipient: String, // 'farmer', 'logistics', 'fpo'
    amount: Number,
    scheduledDate: Date,
    actualDate: Date,
    released: { type: Boolean, default: false }
  }],
  paymentDate: {
    type: Date
  },
  releaseDate: {
    type: Date,
    description: 'When payment was released from escrow'
  },
  notes: String
}, {
  timestamps: true
});

paymentSchema.index({ orderId: 1 });
paymentSchema.index({ buyerId: 1 });
paymentSchema.index({ status: 1 });
// transactionId is already indexed via unique: true

module.exports = mongoose.model('Payment', paymentSchema);
