const sqlite3 = require('sqlite3').verbose();
const { rmSync } = require('fs');
const path = require('path');

const db = new sqlite3.Database('./users.db');
// Create users table if it doesn't exist
// db.serialize(() => {
  // db.run(`CREATE TABLE IF NOT EXISTS users (
  //   id INTEGER PRIMARY KEY AUTOINCREMENT,
  //   username TEXT UNIQUE CHECK (length(username) < 32),
  //   password TEXT,
  //   email TEXT UNIQUE, 
  //   verified INTEGER DEFAULT 0,
  //   subs INTEGER DEFAULT 0,
  //   first_name TEXT NOT NULL CHECK (length(username) < 64),
  //   last_name TEXT NOT NULL CHECK (length(username) < 64)
//   )`);
//   db.run(`CREATE TABLE IF NOT EXISTS msgs (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   sender TEXT NOT NULL,
//   recipient TEXT NOT NULL,
//   message TEXT NOT NULL,
//   timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
// );`)
  // db.run(`CREATE TABLE IF NOT EXISTS reports (
  //   id INTEGER PRIMARY KEY AUTOINCREMENT,
  //   reported_by TEXT NOT NULL,
  //   reported INTEGER NOT NULL,
  //   reason TEXT NOT NULL CHECK (length(reason) < 512),
  //   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  //   FOREIGN KEY (reported_by) REFERENCES users(username),
  //   FOREIGN KEY (reported) REFERENCES pdfs(id),
  //   resolved INTEGER NOT NULL DEFAULT 0)`, (err) => {
  //     if (err) console.error("Error adding Table:", err.message)
  //     else console.log('Made reports successfully')
  //   })
//   db.run(`CREATE TABLE IF NOT EXISTS subs (
//     user_id INTEGER NOT NULL,
//     sub_id INTEGER NOT NULL,
//     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
//     FOREIGN KEY (sub_id) REFERENCES users(id) ON DELETE CASCADE,
//     UNIQUE (user_id, sub_id))`, (err) => {
//       if (err) console.error("Error adding Table:", err.message)
//       else console.log('Made Table successfully')
//  })

//   db.run(`CREATE TABLE IF NOT EXISTS claps (
//     username TEXT NOT NULL,
//     pdf_id INTEGER NOT NULL,
//     FOREIGN KEY (username) REFERENCES users(username),
//     FOREIGN KEY (pdf_id) REFERENCES pdfs(id))`, (err) => {
//       if (err) console.error("Error adding Table:", err.message)
//       else console.log('Made Table successfully')
// });

// db.run('DROP TABLE IF EXISTS subs', (err) => {
//   if (err) console.error('Failed to delete table', err.message)
//   else console.log('Table Deleted')
// })
// db.run(`CREATE TABLE IF NOT EXISTS follows (
//   follower INTEGER NOT NULL,
//   followed INTEGER NOT NULL, 
//   FOREIGN KEY (follower) REFERENCES users(id) ON DELETE CASCADE,
//   FOREIGN KEY (followed) REFERENCES users(id) ON DELETE CASCADE,
//   UNIQUE (follower, followed))`, (err) => {
//   if (err) console.error("Error adding Table:", err.message)
//   else console.log('Made follows successfully')
//   })

// Database
const dbPdf = new sqlite3.Database('./db.sqlite')
// Create users table if it doesn't exist
// dbPdf.serialize(() => {
  // db.run(`CREATE TABLE IF NOT EXISTS pdfs (
  //   id INTEGER PRIMARY KEY AUTOINCREMENT,
  //   title TEXT UNIQUE NOT NULL CHECK (length(title) < 128),
  //   slug TEXT UNIQUE NOT NULL,
  //   filename TEXT NOT NULL CHECK (length(filename) < 128),
  //   uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  //   uploaded_by TEXT NOT NULL,
  //   authors TEXT CHECK (length(authors) < 256),
  //   unis TEXT CHECK (length(unis) < 256),
  //   description TEXT CHECK (length(description) < 512),
  //   claps INTEGER DEFAULT 0,
  //   type INTEGER, 
  //   FOREIGN KEY (uploaded_by) REFERENCES users(username)
  // )`, (err) => {
  //     if (err) console.error("Error adding Table:", err.message)
  //     else console.log('Made pdfs successfully')
  //   })
  // db.run(`CREATE TABLE IF NOT EXISTS comments (
  //   id INTEGER PRIMARY KEY AUTOINCREMENT,
  //   pdf_id INTEGER NOT NULL,
  //   user TEXT NOT NULL,
  //   text TEXT NOT NULL,
  //   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  //   FOREIGN KEY (pdf_id) REFERENCES pdfs(id)
  //   )`,(err) => { 
  //     if (err) console.error("Error adding Table:", err.message)
  //     else console.log('Made comments successfully')
  //   });
  // db.run(`CREATE TABLE IF NOT EXISTS tags (
  //   id INTEGER PRIMARY KEY AUTOINCREMENT,
  //   name TEXT UNIQUE)`, (err) => { 
  //     if (err) console.error("Error adding Table:", err.message)
  //     else console.log('Made tags successfully')
  //   })
  // db.run(`CREATE TABLE IF NOT EXISTS  pdf_tags (
  //   pdf_id INTEGER,
  //   tag_id INTEGER,
  //   PRIMARY KEY (pdf_id, tag_id),
  //   FOREIGN KEY (pdf_id) REFERENCES pdfs(id),
  //   FOREIGN KEY (tag_id) REFERENCES tags(id)
  //   )`, (err) => { 
  //     if (err) console.error("Error adding Table:", err.message)
  //     else console.log('Made pdf_tags successfully')
  //   })
  
  // db.run(`CREATE TABLE IF NOT EXISTS jobs (
  //   id INTEGER PRIMARY KEY AUTOINCREMENT,
  //   username TEXT,
  //   title TEXT,
  //   description TEXT,
  //   reqs TEXT,
  //   contact TEXT, 
  //   pdf TEXT, 
  //   active BOOLEAN DEFAULT 1,
  //   FOREIGN KEY (username) REFERENCES users(username)
  // )`, (err) => { 
  //     if (err) console.error("Error adding Table:", err.message)
  //     else console.log('Made jobs successfully')
  //   })
//   )`);
    db.run('PRAGMA foreign_keys = ON')
// dbPdf.run(`ALTER TABLE pdfs ADD COLUMN claps INTEGER DEFAULT 0`, (err) => {
//   console.log('claps added')
// })
// dbPdf.run('UPDATE pdfs SET claps = 0', (err) => {
//   console.log('claps to 0')
// })
// db.run('ALTER TABLE reports ADD COLUMN resolved INTEGER NOT NULL DEFAULT 0', (err) => {
//   console.log('fname added')
// })
// db.run('ALTER TABLE users ADD COLUMN last_name TEXT NOT NULL', (err) => {
//   console.log('last added')
// })
// db.run("ALTER TABLE users ADD COLUMN last_name TEXT NOT NULL DEFAULT 'dingdong' CHECK (length(first_name) < 64)", (err) => {
//   if (err) console.log(err)
//   console.log('fname added added')
// })
// )
// dbPdf.run('UPDATE prepublish SET type = 1', (err) => {
//   console.log('type set to 1')
// })
// db.run('UPDATE users SET subs = 0', (err) => {
//   console.log('subs to 0')
// })
// dbPdf.run('DROP TABLE IF EXISTS prepublish')
  // db.run(`
  //   CREATE TABLE IF NOT EXISTS prepublish (
  //    id INTEGER PRIMARY KEY AUTOINCREMENT,
  //    title TEXT NOT NULL CHECK (length(title) < 128),
  //    slug TEXT UNIQUE NOT NULL,
  //    filename TEXT NOT NULL CHECK (length(filename) < 128),
  //    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  //    uploaded_by TEXT NOT NULL,
  //    description TEXT CHECK (length(description) < 512),
  //    type INTEGER DEFAULT 1,
  //    FOREIGN KEY (uploaded_by) REFERENCES users(username)
  //   )`, (err) => {
  //     if (err) console.error("Error adding Table:", err.message)
  //     else console.log('prepublish added')
  //   }
  // )
// });
// db.run(`
//   CREATE TABLE IF NOT EXISTS feedblack (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   pdf_id INTEGER NOT NULL,
//   page_number INTEGER NOT NULL,
//   x REAL NOT NULL,
//   y REAL NOT NULL,
//   text TEXT NOT NULL,
//   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//   created_by TEXT NOT NULL,
//   FOREIGN KEY (pdf_id) REFERENCES prepublish(id),
//   FOREIGN KEY (created_by) REFERENCES users(username))`, (err) => {
//     if (err) console.error("Error adding Table:", err.message)
//     else console.log('feedblack added')
//   })


// db.run(`
//   CREATE TABLE IF NOT EXISTS currentAffs (
//   user_id INTEGER NOT NULL,
//   aff TEXT NOT NULL CHECK (length(aff) < 64),
//   FOREIGN KEY (user_id) REFERENCES users(id),
//   UNIQUE (user_id, aff))`, (err) => {
//     if (err) console.error("Error adding Table:", err.message)
//      else console.log('current affs added')
//   })

//   db.run(`
//   CREATE TABLE IF NOT EXISTS pastAffs (
//   user_id INTEGER NOT NULL,
//   aff TEXT NOT NULL CHECK (length(aff) < 64),
//   FOREIGN KEY (user_id) REFERENCES users(id),
//   UNIQUE (user_id, aff))`, (err) => {
//     if (err) console.error("Error adding Table:", err.message)
//      else console.log('past affs added')
//   })

//   db.run(`
//   CREATE TABLE IF NOT EXISTS linkAffs (
//   user_id INTEGER NOT NULL,
//   link TEXT NOT NULL CHECK (length(link) < 96),
//   FOREIGN KEY (user_id) REFERENCES users(id),
//   UNIQUE (user_id, link))`, (err) => {
//     if (err) console.error("Error adding Table:", err.message)
//      else console.log('link affs added')
//   })

// db.run('DROP TABLE IF EXISTS features', (err) => {
//   if (err) console.error('Failed to delete table', err.message)
//   else console.log('Table Deleted')
// })

// db.run(`CREATE TABLE IF NOT EXISTS features (
//   id INTEGER PRIMARY KEY,
//   link TEXT NOT NULL,
//   details TEXT CHECK (length(details) < 256))`, (err) => {
//     if (err) console.error("Error adding Table:", err.message)
//      else console.log('link affs added')
//   })
// db.run(`ALTER TABLE news ADD COLUMN time DATETIME DEFAULT CURRENT_TIMESTAMP`, (err) => {
//       if (err) console.error("Error adding Table:", err.message)
//      else console.log('link affs added')
// })

// db.run(`CREATE TABLE IF NOT EXISTS news (
//   id INTEGER PRIMARY KEY,
//   content TEXT NOT NULL CHECK (length(content) < 256))`,(err) => {
//     if (err) console.error("Error adding Table:", err.message)
//      else console.log('link affs added')
//   })

module.exports = { db, dbPdf }