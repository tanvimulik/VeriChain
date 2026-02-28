const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userType: {
      type: String,
      enum: ['Farmer', 'Buyer', 'Logistics', 'Admin'],
      required: true,
    },
    type: {
      type: String,
      enum: [
        'new_order',
        'order_accepted',
        'payment_received',
        'truck_assigned',
        'storage_approved',
        'rating_received',
        'order_delivered',
        'general',
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedId: mongoose.Schema.Types.ObjectId,
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
