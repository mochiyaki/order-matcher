const Driver = require('../models/Driver');
const Order = require('../models/Order');

class MatchingService {
  /**
   * Find the best driver for an order based on proximity, workload, and other factors
   * @param {Object} order - The order to match with a driver
   * @param {Object} options - Matching options (radius, weights, etc.)
   * @returns {Object|null} Best matching driver or null if none found
   */
  static async findBestDriver(order, options = {}) {
    try {
      // Default options
      const defaultOptions = {
        radius: 10000, // 10km radius by default
        proximityWeight: 0.4,
        workloadWeight: 0.3,
        ratingWeight: 0.2,
        completionTimeWeight: 0.1,
        ...options
      };

      const { radius, proximityWeight, workloadWeight, ratingWeight, completionTimeWeight } = defaultOptions;

      // Get available drivers within the specified radius
      const nearbyDrivers = await this.getNearbyAvailableDrivers(order.address.coordinates[1], order.address.coordinates[0], radius);

      if (!nearbyDrivers || nearbyDrivers.length === 0) {
        return null;
      }

      // Score each driver
      const scoredDrivers = nearbyDrivers.map(driver => {
        return {
          ...driver,
          score: this.calculateDriverScore(driver, order, defaultOptions)
        };
      });

      // Sort by score (highest first)
      scoredDrivers.sort((a, b) => b.score - a.score);

      // Return the best driver
      return scoredDrivers.length > 0 ? scoredDrivers[0] : null;
    } catch (error) {
      console.error('Error finding best driver:', error);
      throw new Error('Failed to find best driver for order');
    }
  }

  /**
   * Get nearby available drivers within a specified radius
   * @param {number} lat - Latitude of the pickup point
   * @param {number} lng - Longitude of the pickup point
   * @param {number} radius - Search radius in meters
   * @returns {Array} Array of nearby drivers
   */
  static async getNearbyAvailableDrivers(lat, lng, radius) {
    try {
      const drivers = await Driver.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: [lng, lat] },
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

      return drivers;
    } catch (error) {
      console.error('Error getting nearby drivers:', error);
      throw new Error('Failed to fetch nearby drivers');
    }
  }

  /**
   * Calculate a score for a driver based on various factors
   * @param {Object} driver - The driver object
   * @param {Object} order - The order object
   * @param {Object} options - Scoring options
   * @returns {number} Calculated score
   */
  static calculateDriverScore(driver, order, options) {
    // Calculate distance score (inverse relationship - closer is better)
    let distanceScore = 0;
    if (driver.distance && driver.distance > 0) {
      // Normalize to 0-1 scale (1 being closest)
      const maxDistance = options.radius;
      distanceScore = Math.max(0, 1 - (driver.distance / maxDistance));
    }

    // Calculate workload score (inverse relationship - less workload is better)
    let workloadScore = 0;
    if (driver.totalOrders) {
      // Normalize to 0-1 scale (0 being high workload, 1 being low workload)
      // Assuming a reasonable maximum workload
      const maxWorkload = 20; // arbitrary max orders for normalization
      workloadScore = Math.max(0, 1 - (driver.totalOrders / maxWorkload));
    }

    // Calculate rating score (direct relationship - higher is better)
    let ratingScore = 0;
    if (driver.rating) {
      // Normalize to 0-1 scale
      ratingScore = driver.rating / 5;
    }

    // Calculate completion time score (this would typically come from historical data)
    let completionTimeScore = 0.5; // Default for now

    // Calculate weighted score
    const score =
      (distanceScore * options.proximityWeight) +
      (workloadScore * options.workloadWeight) +
      (ratingScore * options.ratingWeight) +
      (completionTimeScore * options.completionTimeWeight);

    return score;
  }

  /**
   * Batch assign orders to drivers
   * @param {Array} orders - Array of orders to assign
   * @returns {Array} Assignment results
   */
  static async batchAssignOrders(orders) {
    const results = [];

    for (const order of orders) {
      try {
        const bestDriver = await this.findBestDriver(order);
        if (bestDriver) {
          // Update the order with the assigned driver
          await Order.findByIdAndUpdate(order._id, {
            driverId: bestDriver._id,
            status: 'confirmed'
          });

          results.push({
            orderId: order._id,
            driverId: bestDriver._id,
            success: true,
            message: 'Successfully assigned'
          });
        } else {
          results.push({
            orderId: order._id,
            driverId: null,
            success: false,
            message: 'No suitable driver found'
          });
        }
      } catch (error) {
        console.error(`Error assigning driver to order ${order._id}:`, error);
        results.push({
          orderId: order._id,
          driverId: null,
          success: false,
          message: `Error: ${error.message}`
        });
      }
    }

    return results;
  }

  /**
   * Reassign an order to a different driver
   * @param {string} orderId - ID of the order to reassign
   * @param {string} newDriverId - ID of the new driver
   * @returns {Object} Assignment result
   */
  static async reassignOrder(orderId, newDriverId) {
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          driverId: newDriverId,
          status: 'confirmed'
        },
        { new: true }
      ).populate('customerId', 'name email')
       .populate('driverId', 'userId');

      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    } catch (error) {
      console.error(`Error reassigning order ${orderId}:`, error);
      throw new Error('Failed to reassign order');
    }
  }
}

module.exports = MatchingService;