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
// app.use(cookieParser());

app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs')
app.engine('ejs', require('ejs').__express)

// Load or initialize pages
let pages = [];
if (fs.existsSync('pages.json')) {
  pages = JSON.parse(fs.readFileSync('pages.json'));
}

// Paths
app.get('/', (req, res) => res.render('main', { pages }))
app.get('/newuser', (req, res) => res.render('newuser'))

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



// // environment variable
const port = process.env.PORT || 3000 // use the chosen variable if available, if not use 3000
app.listen(port, () => console.log(`Listening on port ${port}`))