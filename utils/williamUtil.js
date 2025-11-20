const { Book } = require('../models/book');
const fs = require('fs').promises;
const path = require('path');
const BOOK_FILE = path.join('utils', 'books.json');
const TEMPLATE_FILE = path.join('utils', 'books.template.json');

async function deleteBook(req, res) {

}
module.exports = { deleteBook };