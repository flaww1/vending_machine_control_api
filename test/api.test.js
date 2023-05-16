const request = require('supertest');

const app = require('../src/app');

describe('GET /api/routes/', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        message: 'API - 👋🌎🌍🌏'
      }, done);
  });
});

describe('GET /api/', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, ['😀', '😳', '🙄'], done);
  });
});
