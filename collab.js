require("dotenv").config()
const https = require('https')
const http = require('http');
const httpProxy = require('http-proxy');
const express = require('express')
const app = express()
const path = require('path')
const cors = require("cors")
const bodyParser = require('body-parser')
const multer = require('multer')
const session = require('express-session')
const bcrypt = require('bcrypt')
const sqlite3 = require('sqlite3').verbose()
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
// const { spawn } = require('child_process');
// const { exec } = require('child_process')
// const {parse} = require('csv-parse');
// const readline = require('readline')
// const Joi = require('joi');
// const os = require('os')
const fs = require('fs')
// const EventEmitter = require('events')


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
// app.use(cookieParser());

app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs')
app.engine('ejs', require('ejs').__express)

jwtSecret = process.env.secretKey
BASE_URL = process.env.BASE_URL

let db = new sqlite3.Database('./users.db');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or use SMTP for better control
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAILPW
  }
});


// Load or initialize pages
let pages = [];
if (fs.existsSync('pages.json')) {
  pages = JSON.parse(fs.readFileSync('pages.json'));
}

// Create users table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    email TEXT UNIQUE, 
    verified INTEGER DEFAULT 0
  )`);
});
  

// Bcrypt for Routes and Authentication
// const users = [];

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/verify/:token', (req, res) => {
     const token = req.params;
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


app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    console.log(username + ' ' + email)
    const verificationToken = crypto.randomBytes(32).toString('hex');
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
            res.render('message', { message: 'Verification email sent!' });
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

app.post('/login', async (req, res) => {
    const { identifier, password } = req.body
    db.get(
    `SELECT * FROM users WHERE username = ? OR email = ?`,
    [identifier, identifier],
    async (err, user) => {
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.send('Invalid credentials');
      }
      if (!user.is_verified) return res.send('Please verify your email before logging in.');
    req.session.user = { username: user.username }
    res.redirect('/dashboard');
  });

    // const user = users.find(u => u.username --- username)
    // if (!user) return res.status(401).send('User not found')

    // const match = await bcrypt.compare(password, user.password);
    // if (!match) return res.status(401).send('Incorrect password')
    
    // req.session.user = user.username
    // res.redirect('/dashboard')
})

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session.user) { 
        
        next()
    } else {
        res.redirect('/login')
    }
}
app.get('/dashboard', requireAuth, (req, res) => {
    const username = req.session.user.username
    res.render('dashboard', { username })
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
app.get('/', (req, res) => {
    const username = req.session.user ? req.session.user.username : 'Guest';
    res.render('index', { username })
})

app.get('/newuser', (req, res) => res.render('newuser'))



// Dynamic page route
app.get('/pages/:slug', (req, res) => { // is used to handle any calls to /pages/
  let page = pages.find(p => p.slug === req.params.slug);
  if (!page) return res.status(404).send('Page not found');
  res.render('page', { page }); // gets page.ejs and sends in the object page from pages
});

// Storing Images
const storage = multer.diskStorage({
    destination: './public/images',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload  = multer({ storage })

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


// Password Generation
function isStrongPassword(pw) {
  return pw.length >= 8 &&
         /[a-z]/.test(pw) &&
         /[A-Z]/.test(pw) &&
         /\d/.test(pw);
}







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
const port = process.env.PORT || 3000 // use the chosen variable if available, if not use 3000
app.listen(port, () => console.log(`Listening on port ${port}`))