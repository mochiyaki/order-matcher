const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  photoUrl: {
    type: String,
    required: false
  },
  availableQuantity: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String
  }],
  prepTimeMinutes: {
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

module.exports = mongoose.model('FoodItem', foodItemSchema);