const express = require('express');
const router = express.Router();
const MatchingService = require('../services/matchingService');

// Find best driver for an order
router.post('/orders/:orderId/best-driver', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { options } = req.body;

    // In a real implementation, we would fetch the actual order
    // For now, we'll simulate by passing a mock order object
    const bestDriver = await MatchingService.findBestDriver({
      _id: orderId,
      address: {
        coordinates: [req.body.lng, req.body.lat]
      }
    }, options);

    if (!bestDriver) {
      return res.status(404).json({ error: 'No suitable driver found' });
    }

    res.json(bestDriver);
  } catch (error) {
    console.error('Find best driver error:', error);
    res.status(500).json({ error: 'Server error finding best driver' });
  }
});

// Batch assign orders to drivers
router.post('/orders/batch-assign', async (req, res) => {
  try {
    const { orders } = req.body;
    const results = await MatchingService.batchAssignOrders(orders);

    res.json(results);
  } catch (error) {
    console.error('Batch assign error:', error);
    res.status(500).json({ error: 'Server error in batch assignment' });
  }
});

// Reassign order to a specific driver
router.post('/orders/:orderId/reassign', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { driverId } = req.body;

    const result = await MatchingService.reassignOrder(orderId, driverId);

    res.json(result);
  } catch (error) {
    console.error('Reassign order error:', error);
    res.status(500).json({ error: 'Server error reassigning order' });
  }
});

module.exports = router;