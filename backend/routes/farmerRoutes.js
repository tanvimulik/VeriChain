const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  createCrop,
  getMyListings,
  updateCrop,
  deleteCrop,
  getIncomingOrders,
  acceptOrder,
  rejectOrder,
  getAssignedTrucks,
  getMyStorage,
  requestStorageExtension,
  getMyPayments,
  getMyRatings,
  respondToRating,
  getMyNotifications,
  markNotificationRead,
} = require('../controllers/farmerController');

// Crop Management
router.post('/crops', authMiddleware, createCrop);
router.get('/crops/my-listings', authMiddleware, getMyListings);
router.put('/crops/:id', authMiddleware, updateCrop);
router.delete('/crops/:id', authMiddleware, deleteCrop);

// Orders
router.get('/orders/incoming', authMiddleware, getIncomingOrders);
router.put('/orders/:id/accept', authMiddleware, acceptOrder);
router.put('/orders/:id/reject', authMiddleware, rejectOrder);

// Trucks
router.get('/trucks/assigned', authMiddleware, getAssignedTrucks);

// Storage
router.get('/storage/my-storage', authMiddleware, getMyStorage);
router.post('/storage/extend', authMiddleware, requestStorageExtension);

// Payments
router.get('/payments', authMiddleware, getMyPayments);

// Ratings
router.get('/ratings', authMiddleware, getMyRatings);
router.post('/ratings/:id/respond', authMiddleware, respondToRating);

// Notifications
router.get('/notifications', authMiddleware, getMyNotifications);
router.put('/notifications/:id/read', authMiddleware, markNotificationRead);

module.exports = router;
