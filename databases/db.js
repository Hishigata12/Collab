const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db = new sqlite3.Database('./users.db');
// Create users table if it doesn't exist
// db.serialize(() => {
  // db.run(`CREATE TABLE IF NOT EXISTS users (
  //   id INTEGER PRIMARY KEY AUTOINCREMENT,
  //   username TEXT UNIQUE,
  //   password TEXT,
  //   email TEXT UNIQUE, 
  //   verified INTEGER DEFAULT 0
//   )`);
//   db.run(`CREATE TABLE IF NOT EXISTS msgs (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   sender TEXT NOT NULL,
//   recipient TEXT NOT NULL,
//   message TEXT NOT NULL,
//   timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
// );`)
// });

// Database
const dbPdf = new sqlite3.Database('./db.sqlite')
// Create users table if it doesn't exist
// dbPdf.serialize(() => {
//   dbPdf.run(`CREATE TABLE IF NOT EXISTS pdfs (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     title TEXT NOT NULL CHECK (length(title) < 128),
//     slug TEXT UNIQUE NOT NULL,
//     filename TEXT NOT NULL CHECK (length(filename) < 128),
//     uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//     uploaded_by TEXT NOT NULL,
//     authors TEXT CHECK (length(authors) < 256),
//     unis TEXT CHECK (length(unis) < 256),
//     description TEXT CHECK (length(description) < 512)
//   )`, (err) => {
//       if (err) console.error("Error adding Table:", err.message)
//       else console.log('Made Table successfully')
//     })
  // dbPdf.run(`CREATE TABLE IF NOT EXISTS comments (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     pdf_id INTEGER NOT NULL,
//     user TEXT NOT NULL,
//     text TEXT NOT NULL,
//     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (pdf_id) REFERENCES pdfs(id)
//     )`);
//   dbPdf.run(`CREATE TABLE IF NOT EXISTS tags (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT UNIQUE)`)
//   dbPdf.run(`CREATE TABLE IF NOT EXISTS  pdf_tags (
//     pdf_id INTEGER,
//     tag_id INTEGER,
//     PRIMARY KEY (pdf_id, tag_id),
//     FOREIGN KEY (pdf_id) REFERENCES pdfs(id),
//     FOREIGN KEY (tag_id) REFERENCES tags(id)
//     )`)
//   dbPdf.run(`CREATE TABLE IF NOT EXISTS jobs (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     username TEXT,
//     title TEXT,
//     description TEXT,
//     reqs TEXT,
//     contact TEXT, 
//     pdf TEXT, 
//     active BOOLEAN DEFAULT 1
//   )`);
//     dbPdf.run('PRAGMA foreign_keys = ON')
// });

// dbPdf.run('DROP TABLE IF EXISTS pdfs', (err) => {
//   if (err) console.error('Failed to delete table', err.message)
//   else console.log('Table Deleted')
// })
module.exports = { db, dbPdf }