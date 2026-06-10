const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Helper function to check if the username is valid (exists in records)
const isValid = (username)=>{ 
  let validUsers = users.filter((user) => user.username === username);
  return validUsers.length > 0;
}

// Helper function to check if username and password match records
const authenticatedUser = (username, password)=>{ 
  let matchingUsers = users.filter((user) => user.username === username && user.password === password);
  return matchingUsers.length > 0;
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body; // Extract credentials from request body

  // Check if both credentials were provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Validate credentials against our in-memory data store
  if (authenticatedUser(username, password)) {
    // Generate JWT access token signed with the secret key "access" (valid for 1 hour)
    let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });

    // Store the token inside the express-session object
    req.session.authorization = {
      accessToken, username
    };

    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;      
  const reviewText = req.query.review;
  const username = req.session.authorization.username;

  // Error Check: Ensures a review text payload was supplied
  if (!reviewText) {
    return res.status(400).json({ message: "Review text parameter is required." });
  }

  // Check if the book exists in our database store
  if (books[isbn]) {
    // If the 'reviews' object doesn't have an entry for this username, it creates it.
    // If it already exists, this assignment overwrites it.
    books[isbn].reviews[username] = reviewText;

    return res.status(200).json({ 
      message: `Review successfully added/modified for ISBN ${isbn} by user '${username}'.` 
    });
  } else {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;                         // Extract the book ISBN from the URL parameters
  const username = req.session.authorization.username; // Retrieve the username from the session context

  // Check if the book exists in the database
  if (books[isbn]) {
    // Check if this specific user has posted a review for this book
    if (books[isbn].reviews[username]) {
      // Delete only this user's review entry from the nested object
      delete books[isbn].reviews[username];
      
      return res.status(200).json({ 
        message: `Review for ISBN ${isbn} posted by user '${username}' has been successfully deleted.` 
      });
    } else {
      // Return an informative message if the user doesn't have an active review on this book
      return res.status(404).json({ 
        message: `No review found for ISBN ${isbn} associated with user '${username}'.` 
      });
    }
  } else {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;