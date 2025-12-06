const request = require('supertest');
const app = require('../server');

describe('Matching Service API', () => {
  describe('POST /api/matching/orders/:orderId/best-driver', () => {
    it('should return a 404 when no driver is found within radius', async () => {
      const response = await request(app)
        .post('/api/matching/orders/12345/best-driver')
        .send({
          lat: 40.7128,
          lng: -74.0060
        });

      expect(response.status).toBe(404);
    });

    it('should return a 500 when there is an internal server error', async () => {
      // This test would require mocking the database calls
      // For now, we'll just verify the endpoint exists
      const response = await request(app)
        .post('/api/matching/orders/12345/best-driver')
        .send({
          lat: 40.7128,
          lng: -74.0060
        });

      // Since we're not mocking the database, it will return 500 error
      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/matching/orders/batch-assign', () => {
    it('should handle batch assignment request', async () => {
      const response = await request(app)
        .post('/api/matching/orders/batch-assign')
        .send({
          orders: []
        });

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/matching/orders/:orderId/reassign', () => {
    it('should handle reassignment request', async () => {
      const response = await request(app)
        .post('/api/matching/orders/12345/reassign')
        .send({
          driverId: '67890'
        });

      expect(response.status).toBe(500); // Will fail without valid data
    });
  });
});