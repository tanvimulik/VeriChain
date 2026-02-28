const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema(
  {
    adminName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: String,
    role: {
      type: String,
      default: 'admin',
    },
    permissions: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', AdminSchema);
