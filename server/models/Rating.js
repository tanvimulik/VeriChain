const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true
  },
  roleContext: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

ratingSchema.index({ fromUserId: 1 });
ratingSchema.index({ toUserId: 1 });
ratingSchema.index({ orderId: 1 });

module.exports = mongoose.model('Rating', ratingSchema);
