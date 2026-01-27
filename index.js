var express = require("express");
var bodyParser = require("body-parser");
const path = require('path');
var app = express();

const PORT = process.env.PORT || 5050;
var startPage = "index.html";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/public/" + startPage);
});

// Static assets
// app.use(express.static("./public"));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // absolute path
});

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
