const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const User = require('../models/User');

// Get all drivers
router.get('/', async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(drivers);
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ error: 'Server error fetching drivers' });
  }
});

// Get driver by ID
router.get('/:id', async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id)
      .populate('userId', 'name email phone');

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json(driver);
  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({ error: 'Server error fetching driver' });
  }
});

// Update driver location
router.put('/:id/location', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const driverId = req.params.id;

    const driver = await Driver.findByIdAndUpdate(
      driverId,
      {
        currentLat: lat,
        currentLng: lng,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json(driver);
  } catch (error) {
    console.error('Update driver location error:', error);
    res.status(500).json({ error: 'Server error updating driver location' });
  }
});

// Update driver status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const driverId = req.params.id;

    const driver = await Driver.findByIdAndUpdate(
      driverId,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json(driver);
  } catch (error) {
    console.error('Update driver status error:', error);
    res.status(500).json({ error: 'Server error updating driver status' });
  }
});

// Get available drivers near a location
router.get('/available', async (req, res) => {
  try {
    const { lat, lng, radius = 10000 } = req.query; // Default radius 10km

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const drivers = await Driver.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: "distance",
          maxDistance: radius,
          spherical: true
        }
      },
      {
        $match: {
          status: "available"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          currentLat: 1,
          currentLng: 1,
          status: 1,
          rating: 1,
          totalOrders: 1,
          earnings: 1,
          distance: 1,
          "user.name": 1,
          "user.email": 1,
          "user.phone": 1
        }
      }
    ]);

    res.json(drivers);
  } catch (error) {
    console.error('Get available drivers error:', error);
    res.status(500).json({ error: 'Server error fetching available drivers' });
  }
});

module.exports = router;