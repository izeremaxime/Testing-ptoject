import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../../app.js';
import User from '../../models/User.js';
import Todo from '../../models/Todo.js';
import Notification from '../../models/Notification.js';
import { ROLES } from '../../config/constants.js';

/** Set in .env.test to skip MongoMemoryServer (e.g. Windows/OneDrive timeouts): mongodb://127.0.0.1:27017 */
const TEST_MONGO_URI = process.env.TEST_MONGO_URI;

describe('Todo API (integration)', () => {
  let mongod;
  let adminToken;
  let userToken;
  let adminId;
  let userId;

  before(async function connect() {
    this.timeout(180000);
    if (TEST_MONGO_URI) {
      await mongoose.connect(TEST_MONGO_URI, { dbName: process.env.TEST_DB_NAME || 'todo_integration_test' });
      await Promise.all([
        User.deleteMany({}),
        Todo.deleteMany({}),
        Notification.deleteMany({}),
      ]);
    } else {
      mongod = await MongoMemoryServer.create({
        instance: {
          /** Default is 10s; slow disks / first run need more (see terminal GenericMMSError). */
          launchTimeout: 120000,
        },
      });
      await mongoose.connect(mongod.getUri());
    }

    await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'Aa1!aaaa',
      role: ROLES.ADMIN,
      emailVerified: true,
    });
    await User.create({
      name: 'Regular',
      email: 'user@test.com',
      password: 'Aa1!bbbb',
      role: ROLES.USER,
      emailVerified: true,
    });

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'Aa1!aaaa',
    });
    adminToken = adminLogin.body.data.accessToken;
    adminId = adminLogin.body.data.user.id;

    const userLogin = await request(app).post('/api/auth/login').send({
      email: 'user@test.com',
      password: 'Aa1!bbbb',
    });
    userToken = userLogin.body.data.accessToken;
    userId = userLogin.body.data.user.id;
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  it('creates todo as user', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Exam task', description: 'desc', priority: 'high' });
    expect(res.status).to.equal(201);
    expect(res.body.data.title).to.equal('Exam task');
    expect(res.body.data.status).to.equal('pending');
  });

  it('lists todos with auth', async () => {
    const res = await request(app)
      .get('/api/todos')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
  });

  it('admin can access system analytics', async () => {
    const res = await request(app)
      .get('/api/analytics/system')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).to.equal(200);
    expect(res.body.data.totalUsers).to.be.at.least(2);
  });

  it('regular user cannot access system analytics', async () => {
    const res = await request(app)
      .get('/api/analytics/system')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).to.equal(403);
  });

  it('performance: list todos responds under 2s', async () => {
    const start = Date.now();
    const res = await request(app)
      .get('/api/todos?limit=5')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).to.equal(200);
    expect(Date.now() - start).to.be.below(2000);
  });

  it('admin assigns todo and creates notification', async () => {
    const create = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Assignable', description: 'x' });
    const todoId = create.body.data._id;
    const assign = await request(app)
      .post(`/api/todos/${todoId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId });
    expect(assign.status).to.equal(200);

    const notif = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${userToken}`);
    expect(notif.status).to.equal(200);
    expect(notif.body.data.length).to.be.at.least(1);
  });
});
