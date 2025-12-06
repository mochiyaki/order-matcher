const mongoose = require('mongoose');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Order = require('../models/Order');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ordermatcher', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Driver.deleteMany({});
    await Order.deleteMany({});

    console.log('Database cleared');

    // Create sample users
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    const customerUser = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'customer'
    });

    const driverUser = new User({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      role: 'driver'
    });

    await adminUser.save();
    await customerUser.save();
    await driverUser.save();

    console.log('Sample users created');

    // Create sample driver
    const driver = new Driver({
      userId: driverUser._id,
      status: 'available',
      rating: 4.8,
      totalOrders: 150,
      earnings: 5000
    });

    await driver.save();

    console.log('Sample driver created');

    // Create sample order
    const order = new Order({
      customerId: customerUser._id,
      address: {
        type: 'Point',
        coordinates: [-74.0060, 40.7128], // New York coordinates
        street: '123 Main St',
        city: 'New York',
        zipCode: '10001'
      },
      items: [
        {
          foodItemId: mongoose.Types.ObjectId(),
          quantity: 2,
          unitPrice: 15.99,
          subtotal: 31.98
        }
      ],
      totalAmount: 31.98,
      status: 'created'
    });

    await order.save();

    console.log('Sample order created');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();