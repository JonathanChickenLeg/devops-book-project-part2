const fs = require('fs').promises;
const path = require('path');
const USER_FILE = path.join('utils', 'users.json');
async function retrieveUsers(req, res) {
    try {
        const data = await fs.readFile(USER_FILE, 'utf8');
        const allUsers = JSON.parse(data);
        return res.status(200).json(allUsers);
    } catch (error) {
        // Handle case where file does not exist yet
        if (error.code === 'ENOENT') {
            return res.status(200).json([]); // return empty list if no file
        }
        return res.status(500).json({ message: error.message });
    }
}
module.exports = { retrieveUsers };