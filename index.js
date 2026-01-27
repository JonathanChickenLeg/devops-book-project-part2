var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var path = require('path');

const PORT = process.env.PORT || 5050;
var startPage = "index.html";
const PUBLIC_DIR = path.join(__dirname, 'public');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  const indexPath = path.join(PUBLIC_DIR, startPage);
  res.sendFile(indexPath, (err) => {
    if (!err) return;
    // If index.html is missing in CI (e.g., Jenkins), serve a minimal fallback
    console.error('Failed to serve index.html:', err.code || err.message);
    res
      .status(200)
      .type('html')
      .send(
        '<!doctype html><html><head><title>Library Book System</title></head><body><main><h1>Library Book System</h1></main></body></html>'
      );
  });
});

// Static assets
app.use(express.static(PUBLIC_DIR));

const { retrieveUsers } = require("./utils/retrieveUserUtil");
app.get("/retrieve-users", retrieveUsers);

const { addUser } = require("./utils/jonathanUtil");
app.post("/add-user", addUser);

const { deleteBook } = require('./utils/williamUtil')
app.delete('/delete-book', deleteBook)

const { updateBook } = require('./utils/editBookUtil')
app.put('/books/:title', updateBook)

const { addBook } = require("./utils/bryanUtil");
app.post("/books", addBook);

const { getBooks } = require("./utils/retrieveBooksUtil");
app.get("/books", getBooks);

server = app.listen(PORT, function () {
  const address = server.address();
  const baseUrl = `http://${
    address.address == "::" ? "localhost" : address.address
  }:${address.port}`;
  console.log(`Demo project at: ${baseUrl}`);
});

module.exports = { app, server };
