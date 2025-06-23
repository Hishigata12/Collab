require("dotenv").config()
const https = require('https')
const http = require('http');
const httpProxy = require('http-proxy');
const express = require('express')
const app = express()
const path = require('path')
const cors = require("cors")
const bodyParser = require('body-parser')
// const multer = require('multer')
const {upload, uploadPdf} = require('./middleware/multerware')
const session = require('express-session')
const bcrypt = require('bcrypt')
const sqlite3 = require('sqlite3').verbose()
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const slugify = require('slugify')
const { Server } = require('socket.io')
// const { spawn } = require('child_process');
// const { exec } = require('child_process')
// const {parse} = require('csv-parse');
// const readline = require('readline')
// const Joi = require('joi');
// const os = require('os')
const fs = require('fs')
// const EventEmitter = require('events')
const { db, dbPdf } = require('./databases/db')
const sharedSession = require('express-socket.io-session');
const routes = require('./routes/indexRoutes')
const { requireAuth } = require('./middleware/middleware')
const { isStrongPassword } = require('./middleware/controlware')


app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public/')))
app.use(express.urlencoded({extended: false}))
app.use(session({
    secret: 'mySecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}))
app.use(bodyParser.urlencoded({ extended: true }))

// app.use(cookieParser());

app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs')
app.engine('ejs', require('ejs').__express)
app.use(routes)

const server = http.createServer(app)
const io = new Server(server)

jwtSecret = process.env.secretKey
BASE_URL = process.env.BASE_URL

const transporter = nodemailer.createTransport({
  service: 'gmail', // or use SMTP for better control
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAILPW
  }
});

// Listen for connections
io.on('connection', (socket) => {
  const username = socket.handshake.session.user?.username
  if (!username) return
  console.log(`User ${username} has connected`);

  // Join a room named after the user for direct messaging
  socket.join(username);

  socket.on('private message', ({ to, message }) => {
    io.to(to).emit('private message', {
      from: username,
      message
    });
  });
});

// Setup session middleware
const sessionMw = session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false
});

// Use session in Express
app.use(sessionMw);

// Share session with Socket.IO
io.use(sharedSession(sessionMw, {
  autoSave: true
}));


/////////////////////////REQUESTS\\\\\\\\\\\\\\\\
// Bcrypt for Routes and Authentication
// const users = [];
app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/verify/:token', (req, res) => {
     const { token } = req.params;
     console.log(token)
    try {
        const decoded = jwt.verify(token, process.env.secretKey)
        console.log(decoded)
        const userId = decoded.id;
        console.log(decoded.id)
        db.run(`UPDATE users SET verified = 1 WHERE id = ?`, [userId], function (err) {
        if (err) return res.send('Failed to verify.');
        res.render('message', { message: 'Email successfully verified!' });
        });
    } catch (err) {
        res.render('message', { message: 'Invalid or expired token.' });
  }
});

app.post('/reverify', (req, res) => {
    const { email } = req.body
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
            console.error('Databaes error:', err.message)
            return;
        }
        if (row) {
            console.log('User ID:', row.id)
            const userId = row.id
            const token = jwt.sign({ id: userId }, process.env.secretKey, { expiresIn: '1h'})
            const verifyLink = `${BASE_URL}/verify/${token}`  
            console.log(token)  
            
            
            const mailOptions = {
                from: "Collab",
                to: email,
                subject: 'Verify your email',
                html: `<p>Click to verify your account:</p>
                Click <a href="${verifyLink}">here</a> to verify your email.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Email failed:', error);
            res.send('Failed to send email.')
        } else {
            console.log('Verification email sent:', info.response);
            res.send(`
                <html>
                    <head>
                    <meta http-equiv="refresh" content="4;url=/" />
                    </head>
                    <body>
                    <h2>Verification Email Sent Successfully - Link expires in 1 hour! Redirecting in 5 seconds...</h2>
                    </body>
                </html>
                `);
        }
    });

        } else console.log('No user found with this ID')
    })
})

app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    console.log(username + ' ' + email)
    // const verificationToken = crypto.randomBytes(32).toString('hex');
    if (!isStrongPassword(password)) {
        return res.send('Password must be at least 8 characters and include lowercase, uppercase and numbers')
    }
    const hashed = await bcrypt.hash(password, 10);
     db.run(`INSERT INTO users (username, password, email) VALUES (?, ?, ?)`, [username, hashed, email], err => {
    if (err) return res.send('User already exists.');
    const userId = this.lastID
    const token = jwt.sign({ id: userId }, process.env.secretKey, { expiresIn: '1h'})
    const verifyLink = `${BASE_URL}/verify/${token}`    
    
    
    const mailOptions = {
        from: "Collab",
        to: email,
        subject: 'Verify your email',
        html: `<p>Click to verify your account:</p>
                Click <a href="${verifyLink}">here</a> to verify your email.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Email failed:', error);
            res.send('Failed to send email.')
        } else {
            console.log('Verification email sent:', info.response);
             res.send(`
                <html>
                    <head>
                    <meta http-equiv="refresh" content="4;url=/" />
                    </head>
                    <body>
                    <h2>Verification Email Sent Successfully - Link expires in 1 hour! Redirecting in 5 seconds...</h2>
                    </body>
                </html>
                `);
        }
    });
})
    // res.redirect('/');
    // users.push({ username, password: hashed });
    // res.redirect('/login')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login2', async (req, res) => {
    const { identifier, password } = req.body
    db.get(
    `SELECT * FROM users WHERE username = ? OR email = ?`,
    [identifier, identifier],
    async (err, user) => {
      if (!user) {
        return res.send('No user by that ID');
      }
      if (!user.verified) return res.send('Please verify your email before logging in.');
      bcrypt.compare(password, user.password, (err, match) => {
        if (!match) {
            return res.send('Invalid Password') 
        }
        req.session.user = { username: user.username }
        res.redirect('/')
      })
    
    // res.redirect('/dashboard');
  });
})
//DON'T DELETE-- AUTO LOGIN FOR SITE DEVELOPMENT
app.post('/login3', async (req, res) => { // THIS IS JUST FOR TROUBLESHOOTING
    // const { identifier, password } = req.body
    const identifier = 'Hishigata'
    const password = process.env.HISHI
    db.get(
    `SELECT * FROM users WHERE username = ? OR email = ?`,
    [identifier, identifier],
    async (err, user) => {
      if (!user) {
        return res.send('No user by that ID');
      }
      if (!user.verified) return res.send('Please verify your email before logging in.');
      bcrypt.compare(password, user.password, (err, match) => {
        if (!match) {
            return res.send('Invalid Password') 
        }
        req.session.user = { username: user.username }
        res.redirect('/')
      })
    
    // res.redirect('/dashboard');
  });
})

app.post('/login', async (req, res) => {
    const { identifier, password } = req.body
    db.get(
    `SELECT * FROM users WHERE username = ? OR email = ?`,
    [identifier, identifier],
    async (err, user) => {
      if (!user) {
        return res.json({ success: false, message: 'User not found' });
      }
      if (!user.verified) return res.send('Please verify your email before logging in.');
      bcrypt.compare(password, user.password, (err, match) => {
        if (!match) {
            return res.json({ success: false, message: 'Invalid Password' })
        }
        req.session.user = { username: user.username }
        res.json({ success: true })
      })
    
    // res.redirect('/dashboard');
  });
})


app.get('/dashboard', requireAuth, async (req, res) => {
    const username = req.session.user.username
    // console.log(username)
    dbPdf.all(`
        SELECT * FROM pdfs WHERE uploaded_by = ?`, [username], (err, pdf) => {
            if (err || !pdf) {
                console.log('choke')
                pdf = {
                    title: '',
                    filename: '',
                    uploaded_at: '',
                    uploaded_by: ''
                }
                res.send('no PDF found')
            }
            // console.log(pdf)
            dbPdf.all(`
              SELECT * FROM jobs WHERE username = ?`, [username], (err, jobs) => {
                if (err || !jobs.length === 0) {
                  jobs = {
                    id: 0,
                    title: '',
                    username: '',
                    description: '',
                    reqs: '',
                    contact: '',
                    pdf: '',
                    active: 0
                  }
                }
                res.render('dashboard', { username, pdf, jobs })
              })
        // res.render('dashboard', { username, pdf })
    })
})

// Logging out
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send("Couldn't log out")
        res.redirect('/')
    })
})


// Paths
// app.get('/', (req, res) => res.render('main', { pages }))
// app.get('/', (req, res) => {
//     const username = req.session.user ? req.session.user.username : 'Guest';
//     res.render('index', { username })
// })

app.get('/newuser', (req, res) => res.render('newuser'))



// Dynamic page route
app.get('/pages/:slug', (req, res) => { // is used to handle any calls to /pages/
  let page = pages.find(p => p.slug === req.params.slug);
  if (!page) return res.status(404).send('Page not found');
  res.render('page', { page }); // gets page.ejs and sends in the object page from pages
});



app.post('/upload-image', upload.single('image'), (req, res) => {
    const imageUrl = `/images/${req.file.filename}`
    const slug = req.body.slug
    console.log(slug)
    for (const obj of pages) {
        for (const key in obj) {
            if (obj[key] === slug) {
                obj.profile = imageUrl;
                page = obj
                break;
            }
        }
    }
    fs.writeFileSync('pages.json', JSON.stringify(pages, null, 2));
    if (!page) return res.status(404).send('Page not found');
    // res.render('page', {page})
    res.redirect(`/pages/${slug}`)
    // res.send(`Image uploaded! View it <a href="${imageUrl}">here</a>`);
})




/////////// HANDLING PDF DISPLAY PAGES \\\\\\\\\\\\
app.get('/pdf/:slug', (req, res) => {
  const slug = req.params.slug;
//   let comments = [
//     {
//     user: "black boy",
//     text: "I like icecream"
//   },
//   {
//     user: "white girl",
//     text: "I like whiteclaws"
//   }
//   ]
  
    dbPdf.get('SELECT * FROM pdfs WHERE slug = ?', [slug], (err, pdf) => {
    if (err || !pdf) return res.status(404).send('PDF not found');
        dbPdf.all(`SELECT * FROM comments WHERE pdf_id = ?`, [pdf.id], (err, comments) => {
            if (err) {
                console.error(err)
                return res.send('error loading comments')
            }
            if (!comments) {
                let comments = [
                    {
                        user: "The Warden",
                        text: "No comments yet"
                    }
                ]
            } else {
            dbPdf.all('SELECT * FROM pdfs WHERE slug != ? LIMIT 10', [slug], (err2, related) => {
        // console.log(related)
        console.log(pdf.id)
        // dbPdf.all(`
        //     SELECT * FROM pdf_tags WHERE pdf_id = ?`,[pdf.id], (err, tagNums) => {
        //         console.log(tagNums)
        //         tagNames = tagNums
        //         res.render('projects', { pdf, related, comments, tagNames });
        //     })
                dbPdf.all(`
                    SELECT tags.name FROM tags JOIN pdf_tags ON tags.id = pdf_tags.tag_id
                    WHERE pdf_tags.pdf_id = ?`, [pdf.id], (err, rows) => {
                        if (err) return console.error('Error fetching tags:', err.message)
                        const tagNames = rows.map(row => row.name) 
                    console.log(tagNames)
                    res.render('projects', { pdf, related, comments, tagNames });
                    })
      
            
      })
    }
    });
  });
})
//   const pdf = getPdfBySlug(slug); // custom function
//   const comments = getCommentsForPdf(pdf.id);
//   const relatedPdfs = getRelatedPdfs(pdf.id);

//   res.render('projects', {
//     pdfTitle: pdf.title,
//     pdfFile: pdf.filename,
//     pdfId: pdf.id,
//     pdfUser: pdf.uploaded_by
    // comments,
    // relatedPdfs
//   });


// Multer setup


// // Database
// const dbPdf = new sqlite3.Database('./db.sqlite')
// // Create users table if it doesn't exist
// dbPdf.serialize(() => {
//   dbPdf.run(`CREATE TABLE IF NOT EXISTS pdfs (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     title TEXT NOT NULL,
//     slug TEXT UNIQUE NOT NULL,
//     filename TEXT NOT NULL,
//     uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//     uploaded_by TEXT NOT NULL
//   )`);
//   dbPdf.run(`CREATE TABLE IF NOT EXISTS comments (
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


// Route handling
// Route: Upload PDF
app.post('/upload-pdf', requireAuth, uploadPdf.single('pdf'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded. Check multer.')
    }
  const { title, tags } = req.body;
  tagList = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0)
//   console.log(tagList)
  const slug = slugify(title, { lower: true, strict: true });
//   console.log(req.file)
  const filename = req.file.filename; //req.file.originalname
//   console.log(title)
//   console.log(filename)
//   console.log(req.session.user.username)

  dbPdf.run(
    'INSERT INTO pdfs (title, slug, filename, uploaded_by) VALUES (?, ?, ?, ?)',
    [title, slug, filename, req.session.user.username],
    function (err) {
      if (err) {
        console.error(err);
        return res.send('Error uploading PDF.');
      }
      const pdfId = this.lastID

      tagList.forEach(tag => {
        dbPdf.run(
            `INSERT OR IGNORE INTO tags (name) VALUES (?)`, [tag],
            function (err) {
                if (err) return console.error(err.message)
// Get tag ID
                dbPdf.get(`SELECT id FROM tags WHERE name = ?`, [tag], (err, row) => {
                    if (err) return console.error('Tag select error:', err.message)
                    const tagId = row.id

// Get Link in pdf_tags 
                    dbPdf.run(
                        `INSERT OR IGNORE INTO pdf_tags (pdf_id, tag_id) VALUES (?, ?)`, 
                        [pdfId, tagId], (err) => {
                            if (err) console.error('pdf_tags insert error:', err.message)
                        }

                    )
                })
            }
        )
      })
      res.json({ success: true, title: title, slug: slug });;
    });
});

app.delete('/pdf/:id', (req, res) => {
  const pdfId = req.params.id;

  // Optionally check that the current user owns the file
    dbPdf.get(`SELECT * FROM pdfs WHERE id = ?`, [pdfId], (err, row) => {
        if (row.uploaded_by !== req.session.user.username) {
            return res.status(403).send('Forbidden');
        }
        // console.log(row)
            const filePath = path.join(__dirname, 'public', 'pdfs', path.basename(row.filename));
            // console.log(filePath)

            dbPdf.run(`DELETE FROM pdf_tags WHERE pdf_id = ?`, [pdfId], function (err) {
                if (err) {
                    console.error('Failed to delete related pdf_tags:', err.message)
                    return res.status(500).json({ success: false })
                }
            
                dbPdf.run(`DELETE FROM pdfs WHERE id = ?`, [pdfId], function (err) {
                    if (err) {
                    console.error('Failed to delete PDF:', err.message);
                    return res.status(500).json({ success: false });
                    }
                    // 4. Then delete the actual file
                    fs.unlink(filePath, (fsErr) => {
                    if (fsErr && fsErr.code !== 'ENOENT') {
                        console.error('Failed to delete file:', fsErr.message);
                        // optional: you could still consider it successful if DB delete worked
                        return res.status(500).json({ success: false, message: 'File delete error' });
                    }

                    // // Also delete related entries (like from pdf_tags)
                    // dbPdf.run(`DELETE FROM pdf_tags WHERE pdf_id = ?`, [pdfId]);
                    res.json({ success: true });
                })
            })
        });
    })
});

//////// SEARCHING \\\\\\\\
app.post('/search', (req, res) => {
  const { query } = req.body
  searchTerm = '%' + query + '%'

dbPdf.all(`
    SELECT 
      pdfs.*, 
      COUNT(DISTINCT tags.id) AS tag_match_count,
      (CASE WHEN pdfs.title LIKE ? THEN 1 ELSE 0 END) AS title_match
    FROM pdfs
    LEFT JOIN pdf_tags ON pdfs.id = pdf_tags.pdf_id
    LEFT JOIN tags ON pdf_tags.tag_id = tags.id
    WHERE 
      pdfs.title LIKE ? OR 
      tags.name LIKE ? OR 
      pdfs.uploaded_by LIKE ? OR
      pdfs.uploaded_at LIKE ?
    GROUP BY pdfs.id
    ORDER BY 
      title_match DESC,
      tag_match_count DESC
  `, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm], (err, rows) => {
    if (err) return console.error(err);
    // if (rows) results.push(rows)
    console.log(rows); // display ordered results
    res.json(rows)
  });
})


//////// Handling Comments \\\\\\\\\\
app.post('/add-comment/:slug', requireAuth, (req, res) => {
    const slug = req.params.slug;
    console.log(slug)
    const username = req.session.user.username;
    console.log(username)
    const { comment } = req.body;
    dbPdf.get(`SELECT * FROM pdfs WHERE slug = ?`, [slug], (err, pdf) => {
        console.log(pdf.id)
        dbPdf.run(
        `INSERT INTO comments (pdf_id, user, text) VALUES (?, ?, ?)`, [pdf.id, username, comment],
         (err) => {
            if (err) {
                 console.error(err) 
                return res.send('Failed to add comment')
            }
                else res.redirect(`/pdf/${slug}`)
        }
    )
    })
})


app.get('/random', (req, res) => {
  dbPdf.get('SELECT MAX(id) AS maxID FROM pdfs', (err, row) => {
    if (err) return console.error(err.message)
    const max = row.maxID
    function tryRandom() {
      const myInt = Math.floor(Math.random() * (max)) + 1;
      console.log(myInt)
      dbPdf.get('SELECT * FROM pdfs WHERE id = ?', [myInt], (err, row2) => {
        if (err) return console.err(err.message)
          
        if (row2) {
          console.log(row2)
          res.redirect(`/pdf/${row2.slug}`)
        } else {
          tryRandom()   
        }
      })
    }
    tryRandom()
  })
})


/////// Pages \\\\\\\
//Jobs
app.get('/jobs', (req, res) => {
  dbPdf.all('SELECT * FROM jobs', (err, jobs) => {
    if (err) return console.error(err.message)
      // console.log(jobs)
    res.render('jobs', { jobs })
  })
})

app.post('/jobs', (req, res) => {
  const {search} = req.body
  search2 = '%' + search + '%'
  console.log(search)
  dbPdf.all(`SELECT * FROM jobs WHERE
    title COLLATE NOCASE LIKE ? OR
    description COLLATE NOCASE LIKE ? OR
    reqs COLLATE NOCASE LIKE ? OR
    username COLLATE NOCASE LIKE ? OR
    pdf COLLATE NOCASE LIKE ?;
    `, [search2], (err, jobs) => {
  if (err) return console.error(err.message)
    // console.log(jobs)
  res.render('jobs', { jobs })
  })
})

app.get('/jobs/:id', (req, res) => {
  const id = req.params.id
  dbPdf.get(`
    SELECT * FROM jobs WHERE id = ?`, [id], (err, job) => {
      if (err) return res.error(err)
      if (!job) return res.send('No job found with that id')
        console.log(job)
      res.json(job) 
    })
})

// Route: Upload PDF
app.post('/post-job', requireAuth, uploadPdf.single('pdf'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded. Check multer.')
    }
  const { title, desc, reqs, contact } = req.body;
  const username = req.session.user.username
  // const slug = slugify(title, { lower: true, strict: true });
  const filename = req.file.filename; //req.file.originalname

  dbPdf.run(
    'INSERT INTO jobs (username, title, description, reqs, contact, pdf) VALUES (?, ?, ?, ?, ?, ?)',
    [username, title, desc, reqs, contact, filename],
    function (err) {
      if (err) {
        console.error(err);
        return res.send('Error uploading PDF.');
      }
      res.json({ success: true, title: title, username: username,
         reqs: reqs, contact: contact, filename: filename, id: this.lastID });;
    });
});

app.delete('/jobs/:id', requireAuth, (req, res) => {
  const pdfId = req.params.id;

  // Optionally check that the current user owns the file
    dbPdf.get(`SELECT * FROM jobs WHERE id = ?`, [pdfId], (err, row) => {
        if (row.username !== req.session.user.username || row.username !== process.env.ADMIN) {
            return res.status(403).send('Forbidden');
        }
  // console.log(row)
      const filePath = path.join(__dirname, 'public', 'pdfs', path.basename(row.pdf));
      // console.log(filePath)       
          dbPdf.run(`DELETE FROM jobs WHERE id = ?`, [pdfId], function (err) {
              if (err) {
              console.error('Failed to delete PDF:', err.message);
              return res.status(500).json({ success: false });
              }
              // 4. Then delete the actual file
              fs.unlink(filePath, (fsErr) => {
              if (fsErr && fsErr.code !== 'ENOENT') {
                  console.error('Failed to delete file:', fsErr.message);
                  // optional: you could still consider it successful if DB delete worked
                  return res.status(500).json({ success: false, message: 'File delete error' });
              }

              // // Also delete related entries (like from pdf_tags)
              // dbPdf.run(`DELETE FROM pdf_tags WHERE pdf_id = ?`, [pdfId]);
              res.json({ success: true });
        })
      })
    })
});


/////// MESSAGING \\\\\\\\

app.post('/messages/send', (req, res) => {
  const { sender, recipient, message } = req.body;
  db.run(
    `INSERT INTO messages (sender, recipient, message) VALUES (?, ?, ?)`,
    [sender, recipient, message],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

app.get('/messages/:user1/:user2', (req, res) => {
  const { user1, user2 } = req.params;
  db.all(`
    SELECT * FROM messages
    WHERE (sender = ? AND recipient = ?)
       OR (sender = ? AND recipient = ?)
    ORDER BY timestamp ASC
  `, [user1, user2, user2, user1], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});



//////////////////////////////// OLD CONTENT
// Form POST handler
app.post('/create', (req, res) => {
  const { title, content } = req.body;
  let slugBase = title.toLowerCase().replace(/\s+/g, '-');
  let slug = slugBase;
  let count = 1;

// Check for slug conflicts and append number if needed
    while (pages.find(p => p.slug === slug)) {
    slug = `${slugBase}-${count}`;
    count++;
    }
  // Add page

  pages.push({ title, slug, content });
  fs.writeFileSync('pages.json', JSON.stringify(pages, null, 2));

  res.redirect('/');
});

// SIGN UP POST HANDLER
app.post('/signup', (req, res) => {
  const { name, email } = req.body;
  let slugBase = name.toLowerCase().replace(/\s+/g, '-');
  let slug = slugBase;
  let count = 1;

// Check for slug conflicts and append number if needed
    while (pages.find(p => p.slug === slug)) {
    slug = `${slugBase}-${count}`;
    count++;
    }
  // Add page

  pages.push({ name, slug, email });
  fs.writeFileSync('pages.json', JSON.stringify(pages, null, 2));

  res.redirect('/');
});


// // environment variable
const port = 3500//process.env.PORT || 3000 // use the chosen variable if available, if not use 3000
app.listen(port, () => console.log(`Listening on port ${port}`))


// For setting up https later

// const serverOptions = {
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync('cert.pem')
// };

// https.createServer(serverOptions, app).listen(443, () => {
//   console.log("HTTPS server running on port 443");
// });