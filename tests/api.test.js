const request = require('supertest');
const { app, server } = require('../index');
// Close server after all tests complete
afterAll(() => server.close());
describe('Library Management API', () => {
    let userId;

    it('POST /add-user should create a resource', async () => {
        // Define the resource object to be sent to the API
        const newUser = {
            "username": "API Test user",
                "password": "password123",
                "role": "user"
        };
        // Send a POST request to /add-user with the new user data
        const res = await request(app).post('/add-user').send(newUser);
        // Verify that the API returned the correct status code
        expect(res.status).toBe(201);
        // Check that the new user exists in the returned list
        expect(res.body.some(r => r.username === newUser.username)).toBe(true);
        // Store the user ID for later tests (edit, delete)
        userId = res.body[res.body.length - 1].id;
    });
});