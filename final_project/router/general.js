const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {

  // Creating a promise context to retrieve data non-blockingly
  const getBooksList = new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject({ message: "Unable to load the book database." });
    }
  });

  getBooksList.then((data) => {
    // Send successful response formatted neatly
    return res.status(200).send(JSON.stringify(data, null, 4));
  }).catch((error) => {
    return res.status(500).json(error);
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn; // Retrieve the ISBN from the request parameters

  // Creating a promise to find the book asynchronously (Task 11 requirement)
  const fetchBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ message: `Book with ISBN ${isbn} not found.` });
    }
  });

  fetchBookByISBN
    .then((bookDetails) => {
      // Return 200 OK along with the specific book data
      return res.status(200).json(bookDetails);
    })
    .catch((error) => {
      // Return 404 Not Found if the ISBN key doesn't exist
      return res.status(404).json(error);
    });
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;