import express from "express";
import { readData, writeData } from "../../frontend/utils/data.js";

const router = express.Router();

// Get all users
router.get("/", (req, res) => {
  const data = readData();
  res.json(data.users);
});

// Add new user
router.post("/", (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== "string" || username.trim() === "")
    return res.status(400).json({ error: "Username required" });
  if (typeof password !== "string" || password.trim() === "")
    return res.status(400).json({ error: "Password required" });

  console.log(password)

  const data = readData();
  const existing = data.users.find(user => user.username === username || user === username);

  if (existing) {
    return res.json({ success: false, created: false, error: "Username already taken" });
  }

  const newUser = { username: username.trim(), password: password.trim(), role: "user" };
  data.users.push(newUser);
  writeData(data);

  res.json({ success: true, created: true, user: { username: newUser.username } });
});

export default router;