const mongoose = require('mongoose');

const mandiPriceSchema = new mongoose.Schema({
  cropType: {
    type: String,
    required: true,
    trim: true
  },
  marketName: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    default: 'quintal'
  },
  date: {
    type: Date,
    required: true
  },
  source: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index for unique constraint
mandiPriceSchema.index({ cropType: 1, marketName: 1, date: 1 }, { unique: true });
mandiPriceSchema.index({ cropType: 1, date: -1 });

module.exports = mongoose.model('MandiPrice', mandiPriceSchema);
