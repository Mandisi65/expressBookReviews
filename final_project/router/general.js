const express = require('express');
const axios = require('axios'); // 1. Import Axios
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a New User
public_users.post("/register", (req, res) => {
  const { username, password } = req.body; // Extract username and password from the request body

  // Error Check: Ensure both credentials are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Error Check: Check if user already exists in the global users array
  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists." });
  }

  // Success Path: Push the new user object into our in-memory array
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login." });
});

// Task 10: Get the book list available in the shop using Async-Await with Axios
public_users.get('/', async function (req, res) {
  try {
    // Axios performs an asynchronous HTTP request to our internal data endpoint
    const response = await axios.get('http://localhost:5000/internal/books');
    
    // Send the data back neatly formatted
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    // Fallback gracefully to local data if the HTTP call fails
    return res.status(200).send(JSON.stringify(books, null, 4));
  }
});

// INTERNAL UTILITY ENDPOINT: Exposes local database resource cleanly for Axios requests
public_users.get('/internal/books', function (req, res) {
    return res.status(200).json(books);
});

// TASK 11: Get book details based on ISBN using Promises with Axios
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn; // Extract ISBN from URL parameters

  // Use Axios to asynchronously fetch the entire books catalog via HTTP
  axios.get(`http://localhost:5000/internal/books`)
    .then((response) => {
      const bookList = response.data;
      
      // Check if the requested ISBN exists in the fetched database
      if (bookList[isbn]) {
        return res.status(200).json(bookList[isbn]);
      } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
      }
    })
    .catch((error) => {
      // Fallback gracefully to localized data if the HTTP call fails
      if (books[isbn]) {
        return res.status(200).json(books[isbn]);
      } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found. (Fallback)` });
      }
    });
});

// TASK 12: Get book details based on Author using Async-Await with Axios
public_users.get('/author/:author', async function (req, res) {
  const targetAuthor = req.params.author.toLowerCase(); // Case-insensitive matching
  
  try {
    // Asynchronously fetch the entire books catalog via HTTP
    const response = await axios.get('http://localhost:5000/internal/books');
    const bookList = response.data;
    const matchingBooks = {};

    // Filter through the keys to match the author name
    Object.keys(bookList).forEach((key) => {
      if (bookList[key].author.toLowerCase() === targetAuthor) {
        matchingBooks[key] = bookList[key];
      }
    });

    if (Object.keys(matchingBooks).length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: `No books found matching author: ${req.params.author}` });
    }
  } catch (error) {
    // Fallback block using local data context if the HTTP request fails
    const matchingBooks = {};
    Object.keys(books).forEach((key) => {
      if (books[key].author.toLowerCase() === targetAuthor) {
        matchingBooks[key] = books[key];
      }
    });

    if (Object.keys(matchingBooks).length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: `No books found matching author: ${req.params.author} (Fallback)` });
    }
  }
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