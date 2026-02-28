const mongoose = require('mongoose');

const hubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  address: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 0
  },
  currentStorage: {
    type: Number,
    default: 0,
    min: 0
  },
  costPerKgDay: {
    type: Number,
    required: true,
    min: 0
  },
  hasColdStorage: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

hubSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hub', hubSchema);
