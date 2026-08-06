import { describe, expect, it, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../index';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Menu from '../models/Menu';
import Order from '../models/Order';

let mongod: MongoMemoryServer;
let menuItemId: string;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await Order.deleteMany({});
  await Menu.deleteMany({});

  const menu = await Menu.create({
    name: 'Classic Burger',
    description: 'desc',
    price: 10,
    image: 'img.jpg'
  });
  menuItemId = menu._id.toString();
});

describe('Order API', () => {
  it('should create a new order successfully', async () => {
    const newOrder = {
      items: [
        { menuItemId, quantity: 2 }
      ],
      customerDetails: {
        name: 'John Doe',
        address: '123 Main St',
        phone: '555-1234'
      }
    };

    const res = await request(app)
      .post('/api/orders')
      .send(newOrder);

    expect(res.status).toBe(201);
    expect(res.body.customerDetails.name).toBe('John Doe');
    expect(res.body.totalAmount).toBe(20); // 10 * 2
    expect(res.body.status).toBe('Order Received');
  });

  it('should return validation errors for missing fields', async () => {
    const invalidOrder = {
      items: [],
      customerDetails: {
        name: '',
        address: '123 Main St',
        phone: ''
      }
    };

    const res = await request(app)
      .post('/api/orders')
      .send(invalidOrder);

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('should fetch an order by ID', async () => {
    // Create an order first
    const createRes = await request(app).post('/api/orders').send({
      items: [{ menuItemId, quantity: 1 }],
      customerDetails: { name: 'Jane', address: '456 Ave', phone: '999' }
    });

    const orderId = createRes.body.orderId;

    // Fetch the order
    const res = await request(app).get(`/api/orders/${orderId}`);
    expect(res.status).toBe(200);
    expect(res.body.customerDetails.name).toBe('Jane');
  });

  it('should update order status', async () => {
    const createRes = await request(app).post('/api/orders').send({
      items: [{ menuItemId, quantity: 1 }],
      customerDetails: { name: 'Jane', address: '456 Ave', phone: '999' }
    });

    const orderId = createRes.body.orderId;

    const res = await request(app).patch(`/api/orders/${orderId}/status`).send({
      status: 'Preparing'
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Preparing');
  });

  it('should return 400 for invalid status', async () => {
    const createRes = await request(app).post('/api/orders').send({
      items: [{ menuItemId, quantity: 1 }],
      customerDetails: { name: 'Jane', address: '456 Ave', phone: '999' }
    });

    const orderId = createRes.body.orderId;

    const res = await request(app).patch(`/api/orders/${orderId}/status`).send({
      status: 'Invalid status'
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid status');
  });

  it('should delete an order successfully', async () => {
    // Create an order first
    const createRes = await request(app).post('/api/orders').send({
      items: [{ menuItemId: menuItemId, quantity: 1 }],
      customerDetails: { name: 'Delete Tester', address: '123 Del St', phone: '123' }
    });

    const orderId = createRes.body.orderId;

    const deleteRes = await request(app).delete(`/api/orders/${orderId}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toBe('Order deleted successfully');

    // Verify it's gone
    const fetchRes = await request(app).get(`/api/orders/${orderId}`);
    expect(fetchRes.status).toBe(404);
  });
});
