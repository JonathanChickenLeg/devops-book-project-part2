// Import required modules and utilities
const fs = require('fs').promises;
const { addUser } = require('../utils/jonathanUtil');
// Mock the 'fs' module so we don't interact with the real file system.
// Instead, we simulate how readFile and writeFile should behave.
jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(),
        writeFile: jest.fn(),
    }
}));
describe('Unit Tests for Utils', () => {
    // Reset mocks before each test to avoid "leaking" state between tests
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('addUser should add a user', async () => {
        // Mock template file so it has an initial array
        const templateData = JSON.stringify([]);
        fs.readFile.mockResolvedValueOnce(templateData); // this resolves the template file
        fs.writeFile.mockResolvedValue();
        const req = {
            body: {
                "username": "Test user",
                "password": "password123",
                "role": "user"
            }
        };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        await addUser(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        // Extract the response
        const response = res.json.mock.calls[0][0];
        // Verify that the last resource matches our input
        expect(response.length).toEqual(1);
        expect(response[0].username).toEqual('Test user');
    });
});