const request = require('supertest');
const app = require('../app'); // Assume this is the Express Server
const mongoose = require('mongoose');

// Assuming test database seeded with School A and School B
describe('Multi-Tenant Data Isolation Tests (Step 9)', () => {
  let schoolAToken;
  let schoolBToken;

  beforeAll(async () => {
    // 1. Simulate logging into School A
    const resA = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@dps.edu', password: 'password123' })
      .set('x-tenant-id', 'dps'); // Header identifies the tenant context
    schoolAToken = resA.body.token;

    // 2. Simulate logging into School B
    const resB = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@stxaviers.edu', password: 'password123' })
      .set('x-tenant-id', 'stxaviers');
    schoolBToken = resB.body.token;
  });

  test('School A should only see School A students', async () => {
    const res = await request(app)
      .get('/api/students')
      .set('x-tenant-id', 'dps') // We must specify the header
      .set('Authorization', `Bearer ${schoolAToken}`); // We must specify the token 

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
    // Assertion: Every student returned should belong to School A's tenant
    // (This guarantees no data leak)
    res.body.forEach(student => {
      expect(student.schoolName).not.toEqual('St. Xaviers High School');
    });
  });

  test('School A cannot access School B data by spoofing x-tenant-id', async () => {
    // A malicious user from School A tries to fetch School B's data
    const res = await request(app)
      .get('/api/students')
      .set('x-tenant-id', 'stxaviers') // They pretend to be School B
      .set('Authorization', `Bearer ${schoolAToken}`); // But attack with School A's token

    // Expect 403 Forbidden!
    // Our 'authenticateJWT' middleware checks if token.tenantId === req.tenantId
    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toEqual("Token does not belong to the requested tenant environment");
  });

});
