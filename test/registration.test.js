const request = require('supertest');
const expect = require('chai').expect;

const app = require('../app'); // Replace '../app' with the path to your app.js file
describe('Registration Route', () => {
    after(async () => {
        // Clean up any test data, like users or tokens, after each test
    });

    it('should return a 400 status code if the email already exists', async () => {
        // Replace 'existing_user@email.com' with a valid email from your database
        const email = 'test@email.com';
        const response = await request(app)
            .post('/register')
            .send({
                first_name: 'John',
                last_name: 'Doe',
                password: 'test@email.com',
                email: email,
                type: 'USER'
            });

        expect(response.status).to.equal(400);
        expect(response.body.message).to.equal('Email already exists.');
    });

    it('should return a 200 status code and a JWT token if the email does not exist', async () => {
        // Replace 'new_user@email.com' with a valid email not in your database
        const email = 'new_user@email.com';
        const response = await request(app)
            .post('/register')
            .send({
                first_name: 'John',
                last_name: 'Doe',
                password: 'new_password',
                email: email,
                type: 'USER'
            });

        expect(response.status).to.equal(200);
        expect(response.body.verificationToken).to.exist;
        expect(response.body.userId).to.exist;
    });



    it('should return a 400 status code if the password is too short', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                first_name: 'John',
                last_name: 'Doe',
                password: 'sho',
                email: 'test@email.com',
                type: 'USER'
            });

        expect(response.status).to.equal(400);
        expect(response.body.message).to.equal('Password must be at least 5 characters long.');
    });




});
