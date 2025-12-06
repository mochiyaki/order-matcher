const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicleInfo: {
    type: String,
    required: false
  },
  currentLat: {
    type: Number,
    required: false
  },
  currentLng: {
    type: Number,
    required: false
  },
  status: {
    type: String,
    enum: ['available', 'on_trip', 'offline'],
    default: 'available'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  earnings: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Driver', driverSchema);