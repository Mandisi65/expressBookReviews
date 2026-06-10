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

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;