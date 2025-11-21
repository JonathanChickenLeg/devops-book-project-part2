// utils/bookUtil.js
const fs = require('fs').promises;
const path = require('path');
const { Book } = require('../models/book');

const BOOK_FILE = path.join(__dirname, 'books.json');
const TEMPLATE_FILE = path.join(__dirname, 'books.template.json');

async function readBooksFile() {
  try {
    const raw = await fs.readFile(BOOK_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    // if missing, seed from template if exists, otherwise return empty array
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

async function writeBooksFile(data) {
  await fs.writeFile(BOOK_FILE, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * GET /books
 * returns { books: [...] }
 */
async function getBooks(req, res) {
  try {
    const data = await readBooksFile();
    res.json({ books: data.books || [] });
  } catch (e) {
    console.error('getBooks error', e);
    res.status(500).json({ error: 'Failed to read books' });
  }
}

/**
 * POST /books
 * body: { user, title, author, content }
 */
async function addBook(req, res) {
  try {
    const { user, title, author, content } = req.body;
    if (!user || !title || !author || !content) {
      return res.status(400).json({ error: 'user, title, author and content required' });
    }

    const data = await readBooksFile();
    data.books = data.books || [];

    // prevent duplicate title for same user
    const exists = data.books.find(b => b.title === title);
    if (exists) {
      return res.status(409).json({ error: 'Book with same title already exists for this user' });
    }

    const newBook = new Book(user, title, author, content);
    data.books.push(newBook);
    await writeBooksFile(data);

    res.json({ message: 'Book added', book: newBook });
  } catch (e) {
    console.error('addBook error', e);
    res.status(500).json({ error: 'Failed to add book' });
  }
}

/**
 * PUT /books/:title
 * body: { title, author, content } — title in body is the new title (can be same)
 * uses :title param as originalTitle (to find record)
 * admins can edit any book, original owner stays
 */
async function updateBook(req, res) {
  try {
    const originalTitle = req.params.title;
    const { title, author, content } = req.body;

    if (!originalTitle || !title || !author || !content) {
      return res.status(400).json({ error: 'original title (param), title, author, content required' });
    }

    const data = await readBooksFile();
    data.books = data.books || [];

    // find book by original title only
    const idx = data.books.findIndex(b => b.title === originalTitle);
    if (idx === -1) return res.status(404).json({ error: 'Book not found' });

    // update fields, preserve original user
    data.books[idx] = {
      ...data.books[idx],
      title,
      author,
      content
    };

    await writeBooksFile(data);

    res.json({ message: 'Book updated', book: data.books[idx] });
  } catch (e) {
    console.error('updateBook error', e);
    res.status(500).json({ error: 'Failed to update book' });
  }
}

module.exports = {
  getBooks,
  addBook,
  updateBook
};
