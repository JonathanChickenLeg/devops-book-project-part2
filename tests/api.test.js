const request = require('supertest');
const { app, server } = require('../index');
// Close server after all tests complete
afterAll(() => server.close());
describe('Library Management API', () => {
    const fs = require('fs');
    const path = require('path');
    const usersFile = path.join(__dirname, '..', 'utils', 'users.json');
    let usersBackup;

    beforeAll(() => {
        // Backup current users.json so we can restore after error-case test
        try {
            usersBackup = fs.readFileSync(usersFile, 'utf8');
        } catch {}
    });

    afterAll(() => {
        // Restore original users.json if we modified it
        try {
            if (usersBackup !== undefined) fs.writeFileSync(usersFile, usersBackup, 'utf8');
        } catch {}
    });

    it('GET /retrieve-users should return users list', async () => {
        const res = await request(app).get('/retrieve-users');
        expect(res.status).toBe(200);
        // retrieveUsers returns the parsed JSON; ensure it has users array
        expect(Array.isArray(res.body.users)).toBe(true);
    });

    it('POST /add-user should create a user', async () => {
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
    });

        it('GET /retrieve-users should include newly added user', async () => {
        const uniqueName = 'API Test re-retrieve ' + Date.now();
        const postRes = await request(app).post('/add-user').send({ username: uniqueName, password: 'pw' });
        expect(postRes.status).toBe(201);

        const getRes = await request(app).get('/retrieve-users');
        expect(getRes.status).toBe(200);
        // retrieveUsers returns parsed JSON; it should contain users array
        const users = Array.isArray(getRes.body) ? getRes.body : getRes.body.users;
        expect(Array.isArray(users)).toBe(true);
        expect(users.some(u => u.username === uniqueName)).toBe(true);
    });

    it('POST /add-user should handle long usernames', async () => {
        const longName = 'x'.repeat(256);
        const res = await request(app).post('/add-user').send({ username: longName, password: 'pw' });
        expect(res.status).toBe(201);
        expect(res.body.some(u => u.username === longName)).toBe(true);
    });

    it('POST /add-user should reject invalid JSON body with 400', async () => {
        const res = await request(app)
            .post('/add-user')
            .set('Content-Type', 'application/json')
            .send('{"bad": invalid');
        // body-parser should return 400 on malformed JSON
        expect([400, 415]).toContain(res.status);
    });

    it('POST /add-user should return 500 when users.json is invalid', async () => {
        // Temporarily corrupt users.json, then restore in afterAll
        fs.writeFileSync(usersFile, '{ this is not json', 'utf8');
        const res = await request(app).post('/add-user').send({ username: 'Corrupt Case', password: 'pw' });
        expect(res.status).toBe(500);
    });
});