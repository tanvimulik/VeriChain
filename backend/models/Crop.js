const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true,
    },
    farmerName: String,
    farmerPhone: String,
    farmerLocation: String,
    state: String,
    district: String,
    
    // Basic Crop Details
    cropName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Fruits', 'Vegetables', 'Grains', 'Pulses', 'Spices', 'Others'],
    },
    subCategory: String,
    variety: String,
    isOrganic: {
      type: Boolean,
      default: false,
    },
    qualityGrade: {
      type: String,
      enum: ['A', 'B', 'C'],
      default: 'B',
    },
    harvestDate: Date,
    
    // Quantity & Pricing
    quantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      enum: ['Kg', 'Ton', 'Quintal'],
      default: 'Kg',
    },
    minimumOrderQuantity: {
      type: Number,
      default: 1,
    },
    pricePerUnit: {
      type: Number,
      required: true,
    },
    isPriceNegotiable: {
      type: Boolean,
      default: true,
    },
    
    // Images & Certificates
    cropImages: [String],
    qualityCertificate: String,
    
    // Status
    listingStatus: {
      type: String,
      default: 'draft',
      enum: ['draft', 'active', 'sold', 'inactive'],
    },
    orderStatus: {
      type: String,
      default: 'available',
      enum: ['available', 'ordered', 'processing', 'in_transit', 'delivered', 'completed'],
    },
    
    // Legacy fields for compatibility
    cropType: String,
    expectedHarvestDate: Date,
    cropImageUrl: String,
    mandiPrice: Number,
    farmerAskingPrice: Number,
    estimatedTransportCost: Number,
    estimatedStorageCost: Number,
    expectedNetIncome: Number,
    status: String,
    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Buyer',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Crop', CropSchema);
