// utils/bryanUtil.js
// Bryan's responsibility: GET books, POST (add new books)
// never touch edits/deletes

const fs = require('fs').promises;
const path = require('path');
const { Book } = require('../models/book');

const BOOK_FILE = path.join(__dirname, 'books.json');
const TEMPLATE_FILE = path.join(__dirname, 'books.template.json');

// -----------------
// read books from JSON file
// returns { books: [...] }
// -----------------
async function readBooksFile() {
  try {
    const raw = await fs.readFile(BOOK_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    // fallback: template if exists, else empty
    try {
      const tpl = await fs.readFile(TEMPLATE_FILE, 'utf8');
      await fs.writeFile(BOOK_FILE, tpl, 'utf8');
      return JSON.parse(tpl);
    } catch {
      await fs.writeFile(BOOK_FILE, JSON.stringify({ books: [] }, null, 2), 'utf8');
      return { books: [] };
    }
  }
}

// -----------------
// write books to JSON file
// -----------------
async function writeBooksFile(data) {
  await fs.writeFile(BOOK_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// -----------------
// GET /books
// -----------------
async function getBooks(req, res) {
  try {
    const data = await readBooksFile();
    res.json({ books: data.books || [] });
  } catch (e) {
    console.error('getBooks error', e);
    res.status(500).json({ error: 'Failed to read books' });
  }
}

// -----------------
// POST /books
// body: { user, title, author, content }
// -----------------
async function addBook(req, res) {
  try {
    const { user, title, author, content } = req.body;
    if (!user || !title || !author || !content) {
      return res.status(400).json({ error: 'user, title, author and content required' });
    }

    const data = await readBooksFile();
    data.books = data.books || [];

    // prevent duplicate title for same user
    const exists = data.books.find(b => b.title === title && b.user === user);
    if (exists) return res.status(409).json({ error: 'Book with same title already exists for this user' });

    const newBook = new Book(user, title, author, content);
    data.books.push(newBook);
    await writeBooksFile(data);

    res.json({ message: 'Book added', book: newBook });
  } catch (e) {
    console.error('addBook error', e);
    res.status(500).json({ error: 'Failed to add book' });
  }
}

module.exports = {
  readBooksFile,
  writeBooksFile,
  getBooks,
  addBook
};
