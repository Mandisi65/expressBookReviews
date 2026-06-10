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
public_users.get('/author/:author', function (req, res) {
  const authorName = req.params.author.toLowerCase(); // Convert parameter to lowercase for case-insensitive matching

  // Creating a promise context to filter entries non-blockingly (Task 12 requirement)
  const fetchBooksByAuthor = new Promise((resolve, reject) => {
    const keys = Object.keys(books);
    const matchingBooks = {};

    keys.forEach((key) => {
      if (books[key].author.toLowerCase() === authorName) {
        matchingBooks[key] = books[key];
      }
    });

    if (Object.keys(matchingBooks).length > 0) {
      resolve(matchingBooks);
    } else {
      reject({ message: `No books found matching author: ${req.params.author}` });
    }
  });

  fetchBooksByAuthor
    .then((filteredBooks) => {
      return res.status(200).json(filteredBooks);
    })
    .catch((error) => {
      return res.status(404).json(error);
    });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const titleName = req.params.title.toLowerCase(); // Convert parameter to lowercase for case-insensitive matching

  // Creating a promise context to filter entries non-blockingly (Task 13 requirement)
  const fetchBooksByTitle = new Promise((resolve, reject) => {
    const keys = Object.keys(books);
    const matchingBooks = {};

    keys.forEach((key) => {
      if (books[key].title.toLowerCase() === titleName) {
        matchingBooks[key] = books[key];
      }
    });

    if (Object.keys(matchingBooks).length > 0) {
      resolve(matchingBooks);
    } else {
      reject({ message: `No books found matching title: ${req.params.title}` });
    }
  });

  fetchBooksByTitle
    .then((filteredBooks) => {
      return res.status(200).json(filteredBooks);
    })
    .catch((error) => {
      return res.status(404).json(error);
    });
});

// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn; // Extract the ISBN parameter from the request URL

  // Check if the book exists in our database object
  if (books[isbn]) {
    // Return a 200 OK status and send back only the reviews sub-object
    return res.status(200).json(books[isbn].reviews);
  } else {
    // Return a 404 Not Found status if the ISBN key is invalid
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }
});

module.exports.general = public_users;