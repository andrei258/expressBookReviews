const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const secretKey = 'super-secret-key';
let users = [{"username": "john", "password": "1234"}];

const isValid = (username)=>{ //returns boolean
    if (!users[username]) {
        return false;
    }
    return true;
}

const authenticatedUser = (username,password)=>{ //returns boolean
    if (users[username].password !== password) {
        return false;
    }
    return true;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
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
  const { review } = req.query; // Extract the review text from the query string
  const { isbn } = req.params; // Extract the ISBN from the URL parameters

  // Check if a review is provided in the query
  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  const token = req.header("Authorization")?.replace("Bearer ", "");
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
      return res.status(201).json({ message: "Review added successfully" });
    }
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
