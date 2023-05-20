const request = require('supertest');

const app = require('../src/app');

const jest = require('jest');
/*
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
*/

const { getUserByEmail } = require('./lib/persistence');

describe('getUserByEmail', () => {
  it('should retrieve a user by email', async () => {
    // Mock the email and expected user object
    const email = 'test@example.com';
    const expectedUser = {
      userId: 3,
      first_name: 'Diana',
      last_name: 'Lima',
      password: 'hashedPassword',
      email: 'diana@email.com',
      type: 'USER'
    };

    // Mock the Prisma client and the findUnique method
    const prismaClientMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue(expectedUser)
      }
    };

    // Call the getUserByEmail function
    const user = await getUserByEmail(email, false);

    // Verify that the Prisma client's findUnique method was called with the correct arguments
    expect(prismaClientMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: email
      },
      select: {
        userId: true,
        first_name: true,
        last_name: true,
        password: false,
        email: true,
        type: true
      }
    });

    // Verify that the retrieved user matches the expected user object
    expect(user).toEqual(expectedUser);
  });

  it('should return null if user is not found', async () => {
    // Mock the email
    const email = 'nonexistent@example.com';

    // Mock the Prisma client and the findUnique method
    const prismaClientMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null)
      }
    };

    // Call the getUserByEmail function
    const user = await getUserByEmail(email, false);

    // Verify that the Prisma client's findUnique method was called with the correct arguments
    expect(prismaClientMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: email
      },
      select: {
        userId: true,
        first_name: true,
        last_name: true,
        password: false,
        email: true,
        type: true
      }
    });

    // Verify that the user is null
    expect(user).toBeNull();
  });
});
