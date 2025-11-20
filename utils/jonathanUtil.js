const { User } = require('../models/user');
const fs = require('fs').promises;
const path = require('path');
const USER_FILE = path.join('utils', 'users.json');
const TEMPLATE_FILE = path.join('utils', 'users.template.json');

async function addUser(req, res) {
  try {
    const { username, password, role } = req.body;
    const newUser = new User(username, password, role);
    let users = [];
    try {
      // Try reading the existing resources.json
      const data = await fs.readFile(USER_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) users = parsed;
      else if (parsed && Array.isArray(parsed.users)) users = parsed.users;
      else users = [];
    } catch (err) {
      if (err.code === 'ENOENT') {
        // If users.json doesn't exist, create it from the template
        const templateData = await fs.readFile(TEMPLATE_FILE, 'utf8');
        const parsedTemplate = JSON.parse(templateData || '{}');
        if (Array.isArray(parsedTemplate)) users = parsedTemplate;
        else if (parsedTemplate && Array.isArray(parsedTemplate.users)) users = parsedTemplate.users;
        else users = [];
        await fs.writeFile(USER_FILE, JSON.stringify({ users }, null, 2), 'utf8');
      } else {
        throw err;
      }
    }
    // Add new user and save to file
    users.push(newUser);
    await fs.writeFile(USER_FILE, JSON.stringify({ users }, null, 2), 'utf8');

    return res.status(201).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}
module.exports = { addUser };