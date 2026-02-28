const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Buyer',
      required: true,
    },
    buyerName: String,
    buyerPhone: String,
    deliveryAddress: String,
    deliveryCoordinates: {
      latitude: Number,
      longitude: Number,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true,
    },
    pickupAddress: String,
    pickupCoordinates: {
      latitude: Number,
      longitude: Number,
    },
    farmerName: String,
    farmerPhone: String,
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
    },
    cropType: String,
    quantity: Number,
    unit: {
      type: String,
      default: 'Kg',
    },
    
    // Request Phase Fields
    requestStatus: {
      type: String,
      default: 'pending_farmer_approval',
      enum: ['pending_farmer_approval', 'accepted', 'farmer_rejected', 'truck_assigned'],
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    farmerResponseMessage: String,
    farmerResponseDate: Date,
    buyerNotes: String,
    
    // Delivery Details
    deliveryType: {
      type: String,
      enum: ['buyer_address'],
      default: 'buyer_address',
    },
    
    // Pricing
    pricePerUnit: Number,
    farmerPrice: Number,
    transportCost: Number,
    platformFee: Number,
    totalAmount: Number,
    
    // Payment
    paymentStatus: {
      type: String,
      default: 'pending',
      enum: ['pending', 'paid', 'failed'],
    },
    escrowStatus: {
      type: String,
      default: 'not_funded',
      enum: ['not_funded', 'funded', 'released'],
    },
    transactionId: String,
    paymentDate: Date,
    paymentMethod: String,
    
    // Order Status
    orderStatus: {
      type: String,
      default: 'pending_farmer_approval',
      enum: [
        'pending_farmer_approval',
        'farmer_rejected',
        'farmer_accepted',
        'payment_pending',
        'paid',
        'truck_assigned',
        'in_transit',
        'delivered',
        'completed'
      ],
    },
    
    // Logistics
    assignedTruckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Truck',
    },
    clusterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cluster',
    },
    truckNumber: String,
    driverName: String,
    driverPhone: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
