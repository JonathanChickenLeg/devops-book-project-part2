// Import required modules and utilities
const fs = require('fs').promises;
const { addUser } = require('../utils/jonathanUtil');
const { retrieveUsers } = require('../utils/retrieveUserUtil');
// Mock the 'fs' module so we don't interact with the real file system.
// Instead, we simulate how readFile and writeFile should behave.
jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(),
        writeFile: jest.fn(),
    }
}));

describe('Unit Tests for Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('addUser', () => {
        it('addUser should add the user', async () => {
            fs.readFile.mockResolvedValueOnce(
                JSON.stringify({ users: [{ username: 'Existing', password: 'pw', role: 'user' }] })
            );
            fs.writeFile.mockResolvedValue();

            const req = { body: { username: 'New', password: 'pw2', role: 'user' } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await addUser(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            const response = res.json.mock.calls[0][0];
            expect(response).toHaveLength(2);
            expect(response[1].username).toBe('New');
            expect(fs.writeFile).toHaveBeenCalledTimes(1);
        });

        it('Returns 500 when users.json contains invalid JSON', async () => {
            fs.readFile.mockResolvedValueOnce('{ this is not json');
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await addUser({ body: { username: 'X', password: 'Y', role: 'user' } }, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            );
        });

        it('Returns 500 when writeFile fails', async () => {
            fs.readFile.mockResolvedValueOnce(JSON.stringify({ users: [] }));
            fs.writeFile.mockRejectedValueOnce(new Error('Disk full'));

            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            await addUser({ body: { username: 'X', password: 'Y', role: 'user' } }, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Disk full' })
            );
        });

        it('Returns 500 when req.body is missing', async () => {
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            await addUser({}, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            );
        });
    });

    describe('retrieveUsers', () => {
        it('Returns users when file exists', async () => {
            const payload = { users: [{ username: 'A' }] };
            fs.readFile.mockResolvedValueOnce(JSON.stringify(payload));

            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            await retrieveUsers({}, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(payload);
        });

        it('Returns 500 on invalid JSON', async () => {
            fs.readFile.mockResolvedValueOnce('');

            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            await retrieveUsers({}, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            );
        });
    });
});