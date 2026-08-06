import { describe, expect, it, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../index';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Menu from '../models/Menu';

let mongod: MongoMemoryServer;

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
  await Menu.deleteMany({});
  await Menu.insertMany([
    { name: 'Classic Burger', description: 'desc', price: 9.99, image: 'img1.jpg' },
    { name: 'Pepperoni Pizza', description: 'desc', price: 14.99, image: 'img2.jpg' }
  ]);
});

describe('Menu API', () => {
  it('should return a list of menu items', async () => {
    const res = await request(app).get('/api/menu');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].name).toBe('Classic Burger');
  });

  it('should create a new menu item', async () => {
    const newItem = {
      name: 'Vegan Salad',
      description: 'Healthy and fresh',
      price: 12.99,
      image: 'http://example.com/salad.jpg'
    };

    const res = await request(app).post('/api/menu').send(newItem);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Vegan Salad');
    expect(res.body._id).toBeDefined();
  });

  it('should return 400 for invalid menu creation data', async () => {
    const invalidItem = {
      name: '',
      price: -5,
      image: 'not-a-url'
    };

    const res = await request(app).post('/api/menu').send(invalidItem);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it('should fetch a menu item by ID', async () => {
    // Get existing items
    const getRes = await request(app).get('/api/menu');
    const itemId = getRes.body[0]._id;

    const res = await request(app).get(`/api/menu/${itemId}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Classic Burger');
  });

  it('should update a menu item by ID', async () => {
    const getRes = await request(app).get('/api/menu');
    const itemId = getRes.body[0]._id;

    const res = await request(app).patch(`/api/menu/${itemId}`).send({
      price: 10.99
    });
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(10.99);
  });

  it('should delete a menu item by ID', async () => {
    const getRes = await request(app).get('/api/menu');
    const itemId = getRes.body[0]._id;

    const deleteRes = await request(app).delete(`/api/menu/${itemId}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toBe('Menu item deleted successfully');

    // Verify deletion
    const verifyRes = await request(app).get(`/api/menu/${itemId}`);
    expect(verifyRes.status).toBe(404);
  });
});
