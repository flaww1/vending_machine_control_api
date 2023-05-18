const request = require('supertest');
const app = require('../src/app');
const { app, passport } = require('../../lib/authentication');

describe('Authentication API', () => {
    // Define test user credentials
    const testUser = {
        email: 'test@email.com',
        password: 'testpassword',
    };

    // Define JWT token for authenticated requests
    let authToken;

    beforeAll((done) => {
        // Perform login before running the tests
        request(app)
            .post('/login')
            .send(testUser)
            .end((err, res) => {
                if (err) throw err;
                authToken = res.body.token; // Assuming your authentication endpoint returns a token
                done();
            });
    });

    afterAll((done) => {
        // Clean up after running the tests, e.g., log out the user
        request(app)
            .get('/logout')
            .end((err) => {
                if (err) throw err;
                done();
            });
    });

    describe('POST /login', () => {
        it('should return a JWT token when valid credentials are provided', (done) => {
            request(app)
                .post('/login')
                .send(testUser)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    expect(res.body.token).toBeTruthy();
                    done();
                });
        });

        it('should return an error when invalid credentials are provided', (done) => {
            const invalidUser = {
                email: 'invalid@email.com',
                password: 'invalidpassword',
            };

            request(app)
                .post('/login')
                .send(invalidUser)
                .expect(401)
                .end((err, res) => {
                    if (err) throw err;
                    expect(res.body.message).toEqual('Wrong credentials for specified user.');
                    done();
                });
        });
    });

    describe('GET /protected-route', () => {
        it('should return a 401 Unauthorized error without a valid token', (done) => {
            request(app)
                .get('/protected-route')
                .expect(401)
                .end((err, res) => {
                    if (err) throw err;
                    expect(res.body.message).toEqual('Invalid token. Unauthorized access.');
                    done();
                });
        });

        it('should return the protected resource with a valid token', (done) => {
            request(app)
                .get('/protected-route')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    expect(res.body).toEqual('Protected Resource');
                    done();
                });
        });
    });
});
