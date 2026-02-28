const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['farmer', 'buyer', 'logistics', 'admin'],
    description: 'User role for access control'
  },
  verified: {
    type: Boolean,
    default: false,
    description: 'Email/Phone verification status'
  },
  profileVerified: {
    type: Boolean,
    default: false,
    description: 'Admin approval status for farmer/buyer profiles'
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'mr'],
    default: 'en',
    description: 'User preferred language'
  },
  notificationPreferences: {
    whatsapp: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    voice: { type: Boolean, default: true }
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  deactivated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries (phone and email already indexed via unique: true, just add role)
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
