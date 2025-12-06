const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');

// Get all orders (admin only)
router.get('/', async (req, res) => {
  try {
    const { status, customerId, driverId } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (customerId) filter.customerId = customerId;
    if (driverId) filter.driverId = driverId;

    const orders = await Order.find(filter)
      .populate('customerId', 'name email')
      .populate('driverId', 'userId')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email')
      .populate('driverId', 'userId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Server error fetching order' });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const { customerId, address, items, notes } = req.body;

    // Validate customer exists
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(400).json({ error: 'Customer not found' });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = items.map(item => {
      const subtotal = item.quantity * item.unitPrice;
      totalAmount += subtotal;
      return {
        foodItemId: item.foodItemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal
      };
    });

    // Create new order
    const order = new Order({
      customerId,
      address,
      items: orderItems,
      totalAmount,
      notes
    });

    await order.save();

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Server error creating order' });
  }
});

// Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('customerId', 'name email')
     .populate('driverId', 'userId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error updating order status' });
  }
});

// Assign driver to order
router.put('/:id/assign-driver', async (req, res) => {
  try {
    const { driverId } = req.body;
    const orderId = req.params.id;

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

// Update order delivery location
router.put('/:id/location', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const orderId = req.params.id;

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        'address.coordinates': [lng, lat],
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Server error updating location' });
  }
});

module.exports = router;