const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  address: {
    street: String,
    city: String,
    zipCode: String
  },
  openHours: {
    type: Map,
    of: String
  },
  phone: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false
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

// Index for geospatial queries
restaurantSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);