// import express from "express";
// import { readData, writeData } from "./data.js";

// const router = express.Router();

// router.get("/:user", (req, res) => {
//   const data = readData();
//   const userBooks = data.books.filter(b => b.user === req.params.user);
//   res.json(userBooks);
// });

// router.post("/", (req, res) => {
//   const { user, title, author, content, editIndex } = req.body;

//   if (!user || !title || !author || !content)
//     return res.status(400).json({ error: "Missing fields" });

//   const data = readData();

//   if (editIndex !== null && editIndex !== undefined) {
//     const userBooks = data.books.filter(b => b.user === user);
//     const actualIndex = data.books.findIndex(
//       b => b.title === userBooks[editIndex]?.title && b.user === user
//     );

//     if (actualIndex !== -1) {
//       data.books[actualIndex] = { user, title, author, content };
//     }
//   } else {
//     data.books.push({ user, title, author, content });
//   }

//   writeData(data);
//   res.json({ success: true });
// });

// export default router;

const { Book } = require('../models/book');
const fs = require('fs').promises;
const path = require('path');
const BOOK_FILE = path.join('utils', 'books.json');
const TEMPLATE_FILE = path.join('utils', 'books.template.json');

async function addBook(req, res) {

}
module.exports = { addBook };