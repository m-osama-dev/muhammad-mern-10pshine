process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';

const { expect } = require('chai');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');

describe('Auth Controller', () => {
  before(async () => {
    await connectTestDB();
  });

  after(async () => {
    await closeTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/auth/signup', () => {
    it('registers a new user and returns a token', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        name: 'Muhammad Osama',
        email: 'osama@example.com',
        password: 'password123',
      });

      expect(res.status).to.equal(201);
      expect(res.body.success).to.equal(true);
      expect(res.body.token).to.be.a('string');
      expect(res.body.data.email).to.equal('osama@example.com');
    });

    it('rejects signup with missing fields', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        email: 'incomplete@example.com',
      });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.equal(false);
    });

    it('rejects duplicate email signup', async () => {
      await User.create({
        name: 'Existing User',
        email: 'dupe@example.com',
        password: 'password123',
      });

      const res = await request(app).post('/api/auth/signup').send({
        name: 'Another User',
        email: 'dupe@example.com',
        password: 'password123',
      });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.match(/already exists/i);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in with correct credentials', async () => {
      await request(app).post('/api/auth/signup').send({
        name: 'Login Test',
        email: 'login@example.com',
        password: 'password123',
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'password123',
      });

      expect(res.status).to.equal(200);
      expect(res.body.token).to.be.a('string');
    });

    it('rejects login with wrong password', async () => {
      await request(app).post('/api/auth/signup').send({
        name: 'Login Test',
        email: 'login2@example.com',
        password: 'password123',
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'login2@example.com',
        password: 'wrongpassword',
      });

      expect(res.status).to.equal(401);
    });
  });
});
