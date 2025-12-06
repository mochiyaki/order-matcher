# Order Matcher

A comprehensive food order and delivery platform featuring intelligent order-to-driver matching algorithms to optimize delivery efficiency and service quality.

## Project Overview

This repository contains the implementation plan and codebase for a modern food delivery application that efficiently matches food orders to available delivery drivers using advanced algorithms. The system aims to:

- Reduce average delivery times through smart matching
- Improve driver utilization and satisfaction
- Provide real-time delivery tracking
- Enhance customer experience with seamless ordering

## Features

- **Intelligent Matching**: Proximity-based, workload-aware driver selection
- **Real-time Tracking**: GPS-enabled delivery monitoring
- **Multi-platform Support**: Native apps for customers and drivers
- **Scalable Architecture**: Microservices-based backend design
- **Performance Analytics**: Comprehensive metrics and reporting

## Implementation Plan

For detailed implementation roadmap, see [PLAN.md](PLAN.md).

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Docker (optional for local development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables by copying `.env.example` to `.env` and updating values
4. Start the application:
   ```bash
   npm run dev
   ```

## Project Structure

```
.
├── models/           # Database schemas
├── routes/           # API endpoints
├── services/         # Business logic and algorithms
├── tests/            # Unit and integration tests
├── .env              # Environment variables
├── server.js         # Main application file
└── package.json      # Dependencies and scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/profile` - Get current user profile

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get specific order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/assign-driver` - Assign driver to order
- `PUT /api/orders/:id/location` - Update delivery location

### Drivers
- `GET /api/drivers` - Get all drivers
- `GET /api/drivers/:id` - Get specific driver
- `PUT /api/drivers/:id/location` - Update driver location
- `PUT /api/drivers/:id/status` - Update driver status
- `GET /api/drivers/available` - Get available drivers near location

### Admin
- `GET /api/admin/orders` - Get all orders (admin)
- `GET /api/admin/drivers` - Get all drivers (admin)
- `POST /api/admin/assign-driver` - Assign order to driver (admin)
- `GET /api/admin/stats` - Get system statistics (admin)

### Matching
- `POST /api/matching/orders/:orderId/best-driver` - Find best driver for an order
- `POST /api/matching/orders/batch-assign` - Batch assign orders to drivers
- `POST /api/matching/orders/:orderId/reassign` - Reassign order to different driver

## Technologies Used

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- Socket.IO for real-time communication
- JWT for authentication
- bcryptjs for password hashing

### Development Tools
- Nodemon for development
- Jest for testing
- Supertest for API testing

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.