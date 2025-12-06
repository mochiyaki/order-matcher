const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Driver = require('../models/Driver');
const User = require('../models/User');
const FoodItem = require('../models/FoodItem');
const Restaurant = require('../models/Restaurant');

// Get all orders (admin)
router.get('/orders', async (req, res) => {
  try {
    const { status, customerId, driverId, page = 1, limit = 20 } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (customerId) filter.customerId = customerId;
    if (driverId) filter.driverId = driverId;

    const orders = await Order.find(filter)
      .populate('customerId', 'name email')
      .populate('driverId', 'userId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      orders,
      totalPages,
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ error: 'Server error fetching admin orders' });
  }
});

// Get drivers list (admin)
router.get('/drivers', async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(drivers);
  } catch (error) {
    console.error('Get admin drivers error:', error);
    res.status(500).json({ error: 'Server error fetching admin drivers' });
  }
});

// Get driver by ID (admin)
router.get('/drivers/:id', async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id)
      .populate('userId', 'name email phone');

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json(driver);
  } catch (error) {
    console.error('Get admin driver error:', error);
    res.status(500).json({ error: 'Server error fetching admin driver' });
  }
});

// Assign order to driver (admin)
router.post('/assign-driver', async (req, res) => {
  try {
    const { orderId, driverId } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { driverId, status: 'confirmed' },
      { new: true }
    ).populate('customerId', 'name email')
     .populate('driverId', 'userId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Assign driver error:', error);
    res.status(500).json({ error: 'Server error assigning driver' });
  }
});

// Get all food items (admin)
router.get('/food-items', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const items = await FoodItem.find()
      .populate('restaurantId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FoodItem.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.json({
      items,
      totalPages,
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get food items error:', error);
    res.status(500).json({ error: 'Server error fetching food items' });
  }
});

// Create new food item (admin)
router.post('/food-items', async (req, res) => {
  try {
    const foodItem = new FoodItem(req.body);
    await foodItem.save();

    res.status(201).json(foodItem);
  } catch (error) {
    console.error('Create food item error:', error);
    res.status(500).json({ error: 'Server error creating food item' });
  }
});

// Update food item (admin)
router.put('/food-items/:id', async (req, res) => {
  try {
    const foodItem = await FoodItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!foodItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    res.json(foodItem);
  } catch (error) {
    console.error('Update food item error:', error);
    res.status(500).json({ error: 'Server error updating food item' });
  }
});

// Delete food item (admin)
router.delete('/food-items/:id', async (req, res) => {
  try {
    const foodItem = await FoodItem.findByIdAndDelete(req.params.id);

    if (!foodItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    res.json({ message: 'Food item deleted successfully' });
  } catch (error) {
    console.error('Delete food item error:', error);
    res.status(500).json({ error: 'Server error deleting food item' });
  }
});

// Get system statistics (admin)
router.get('/stats', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalDrivers = await Driver.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalFoodItems = await FoodItem.countDocuments();

    // Get recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      totalOrders,
      totalDrivers,
      totalCustomers,
      totalFoodItems,
      recentOrders
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error fetching statistics' });
  }
});

module.exports = router;