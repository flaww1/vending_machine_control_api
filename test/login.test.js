const request = require("supertest");
const app = require("../src/app");
describe('Login Testing', () => {
    it('should login with valid credentials', async () => {
        const credentials = {
            email: 'testing@example.com',
            password: 'password123',
        };

        const response = await request(app)
            .post('/auth/login')
            .send(credentials)
            .expect(200);

        // Add assertions to verify the login response
        expect(response.body).toHaveProperty('token');
    });

    it('should return an error for invalid credentials', async () => {
        const credentials = {
            email: 'testing@example.com',
            password: 'incorrectPassword',
        };

        const response = await request(app)
            .post('/auth/login')
            .send(credentials)
            .expect(401);

        // Add assertions to verify the error response
        expect(response.body).toEqual({ message: 'Invalid credentials' });
    });
});
