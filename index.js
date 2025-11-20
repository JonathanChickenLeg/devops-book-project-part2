var express = require('express');
var bodyParser = require("body-parser");
var app = express();

const PORT = process.env.PORT || 5050
var startPage = "index.html";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("./public"));

const { retrieveUsers } = require('./utils/retrieveUserUtil')
app.get('/retrieve-users', retrieveUsers);

const { addUser } = require('./utils/jonathanUtil')
app.post('/add-user', addUser);

// const { addBook } = require('./utils/bryanUtil')
// app.get('/add-book', addBook)

// const { deleteBook } = require('./utils/williamUtil')
// app.get('/delete-book', deleteBook)

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/" + startPage);
})

server = app.listen(PORT, function () {
    const address = server.address();
    const baseUrl = `http://${address.address == "::" ? 'localhost' :
        address.address}:${address.port}`;
    console.log(`Demo project at: ${baseUrl}`);
});

module.exports = { app, server }