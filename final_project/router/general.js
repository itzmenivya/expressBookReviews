const axios = require('axios');
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
      if (!isValid(username)) { 
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});    
      }
    } 
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    res.send(JSON.stringify(books[isbn], null, 4)); 
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;

    // Using Promise
    const getBooksByAuthor = new Promise((resolve, reject) => {
        const bookKeys = Object.keys(books);
        let matchingBooks = [];
        bookKeys.forEach(key => {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
                matchingBooks.push({ isbn: key, ...books[key] });
            }
        });
        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject("No books found by this author");
        }
    });

    getBooksByAuthor
        .then(matchingBooks => res.status(200).send(JSON.stringify(matchingBooks, null, 4)))
        .catch(err => res.status(404).json({ message: err }));
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;

    // Using async/await with Axios style Promise
    const getBooksByTitle = new Promise((resolve, reject) => {
        const bookKeys = Object.keys(books);
        let matchingBooks = [];
        bookKeys.forEach(key => {
            if (books[key].title.toLowerCase() === title.toLowerCase()) {
                matchingBooks.push({ isbn: key, ...books[key] });
            }
        });
        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject("No books found with this title");
        }
    });

    getBooksByTitle
        .then(matchingBooks => res.status(200).send(JSON.stringify(matchingBooks, null, 4)))
        .catch(err => res.status(404).json({ message: err }));
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
