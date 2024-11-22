const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const secretKey = 'super-secret-key'; // Ensure this is defined and accessible
// let users = [];
let users = {
  "john": { "password": "1234" }
};

// Function to check if the user is valid (exists in the users object)
const isValid = (username) => {
  return users.hasOwnProperty(username);
};

// Function to authenticate the user (check password)
const authenticatedUser = (username, password) => {
  return users[username] && users[username].password === password;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
  return res.status(200).json({ message: "Login successful", token });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { review } = req.query;
  const { isbn } = req.params;
  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    const username = decoded.username;

    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }

    if (books[isbn].reviews[username]) {
      books[isbn].reviews[username] = review;
      return res.status(200).json({ message: "Review updated successfully" });
    } else {
      books[isbn].reviews[username] = review;
      return res.status(201).json({ message: "Review added by: " + username });
    }
  });
});

// Delete a book
regd_users.delete("/auth/review/:isbn", (req, res) => {

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
