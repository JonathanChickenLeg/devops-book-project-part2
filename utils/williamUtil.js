const { Book } = require('../models/book');
const fs = require('fs').promises;
const path = require('path');

// path to the stored books file
const BOOK_FILE = path.join('utils', 'books.json');

// tracks timestamps of delete attempts
let deleteTimestamps = [];
let locked = false;

// -----------------
// checks if delete functionality is currently locked due to spamming
// -----------------
function spamGuardActive() {
  return locked;
}

// -----------------
// registers a delete attempt and activates rate limiting if more than five delete attempts occur within 5 seconds
// -----------------
function registerDeleteAttempt() {
  const now = Date.now();
  deleteTimestamps.push(now);

  // remove timestamps older than 10 seconds
  deleteTimestamps = deleteTimestamps.filter(t => now - t <= 10000);

  // activate lock if more than five attempts occurred within 10 seconds
  if (deleteTimestamps.length >= 5 && !locked) {
    locked = true;

    // unlock the delete button again after thirty seconds
    setTimeout(() => {
      locked = false;
      deleteTimestamps = [];
    }, 30000);
  }
}

// -----------------
// delete book by searching for a title match in the JSON file
// -----------------
async function performDelete(title) {
  try {
    // read and parse the book file
    const raw = await fs.readFile(BOOK_FILE, "utf-8");
    const data = JSON.parse(raw);

    // track book count prior to deletion
    const beforeCount = data.books.length;

    // filter out the matching book(s)
    data.books = data.books.filter(b => b.title !== title);

    // register attempt for rate limiting purposes
    registerDeleteAttempt();

    // If count remains unchanged, the requested book was not found
    if (data.books.length === beforeCount) {
      return { deleted: false };
    }

    // Write the updated book list back to the file
    await fs.writeFile(BOOK_FILE, JSON.stringify(data, null, 2));

    return { deleted: true };

  } catch (err) {
    // Log file system or JSON operation errors
    console.error("performDelete error:", err);
    throw err;
  }
}

// -----------------
// wrapper function to handle request/response for deleting books
// -----------------
async function deleteBook(req, res) {
  try {
    // check if delete lock is active (rate limit triggered)
    if (spamGuardActive()) {
      return res.status(429).json({
        success: false,
        message: "Do not spam: wait 30s"
      });
    }

    // extract book title from URL query
    const { title } = req.query;

    // validation: if no title param provided
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "missing parameter: title"
      });
    }

    // actually perform the delete operation
    const result = await performDelete(title);

    // book not found case
    if (!result.deleted) {
      return res.status(404).json({
        success: false,
        message: "book not found"
      });
    }

    // success response
    return res.status(200).json({
      success: true,
      message: "book successfully deleted"
    });

  } catch (err) {
    // log error msg for backend errors
    console.error("deleteBook error:", err);
    return res.status(500).json({
      success: false,
      message: "something went wrong — try again later"
    });
  }
}

module.exports = {
    performDelete, 
    spamGuardActive, 
    deleteBook
};
