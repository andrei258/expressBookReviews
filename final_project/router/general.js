const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    if (users[username]) {
      return res.status(400).json({ message: "Username already exists" });
    }
    users[username] = { password };
    return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/books', async function (req, res) {
    try {
      const stringifiedBooks = JSON.stringify(books);
      return res.status(200).json(JSON.parse(stringifiedBooks));
    } catch (error) {
      console.error('Error while fetching the books:', error);
      return res.status(500).json({ message: 'Error fetching books' });
    }
});

// Get book details based on ISBN
// public_users.get('/isbn/:isbn', function (req, res) {
//     const isbn = req.params.isbn;
//     const book = books[isbn];
//     if (book) {
//       return res.status(200).json(book);
//     } else {
//       return res.status(404).json({ message: "Book not found" });
//     }
// });


// Get book details based on ISBN (using async/await for local data)
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        const book = await getBookDetailsByIsbn(isbn); 
        if (book) {
            return res.status(200).json(book); 
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        console.error('Error while fetching the books:', error);
        return res.status(500).json({ message: "Server error" });
    }
});

async function getBookDetailsByIsbn(isbn) {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject(new Error('Book not found'));
        }
    });
}
  
// // Get book details based on author
// public_users.get('/author/:author',function (req, res) {
//     const author = req.params.author;
//     const filteredBooks = [];
//     for (const key in books) {
//       if (books[key].author === author) {
//         filteredBooks.push(books[key]); 
//       }
//     }
//     if (filteredBooks.length > 0) {
//       return res.status(200).json(filteredBooks);
//     } else {
//       return res.status(404).json({ message: "No books found" });
//     }
// });

// Get book details based on author using async/await
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    const filteredBooks = [];
    try {
        await new Promise((resolve, reject) => {
            for (const key in books) {
                if (books[key].author === author) {
                    filteredBooks.push(books[key]);
                }
            }
            resolve();
        });
  
        if (filteredBooks.length > 0) {
            return res.status(200).json(filteredBooks);
        } else {
            return res.status(404).json({ message: "No books found" });
        }
    } catch (error) {
        console.error("Error filtering books by author:", error);
        return res.status(500).json({ message: "Server error" });
    }
});
  

// // Get all books based on title
// public_users.get('/title/:title',function (req, res) {
//     const title = req.params.title;
//     const filteredBooks = [];
//     for (const key in books) {
//         if (books[key].title === title) {
//           filteredBooks.push(books[key]); 
//         }
//     }
//     if (filteredBooks.length > 0) {
//         return res.status(200).json(filteredBooks);
//     } else {
//         return res.status(404).json({ message: "No books found" });
//     }
// });

// Get all books based on title using async/await
public_users.get('/title/:title', async function (req, res) {

    try {
        const title = req.params.title;
        const filteredBooks = [];
        await new Promise((resolve, reject) => {
            for (const key in books) {
                if (books[key].title === title) {
                    filteredBooks.push(books[key]);
                }
            }
            resolve();
        });
        if (filteredBooks.length > 0) {
            return res.status(200).json(filteredBooks); 
        } else {
            return res.status(404).json({ message: "No books found" });
        }
    } catch (error) {
        console.error("Error filtering books by title:", error);
        return res.status(500).json({ message: "Server error" });
    }
});
  

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
    if (book) {
      return res.status(200).json(book.reviews);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
