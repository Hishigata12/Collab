// const path = require('path');
const fs = require('fs');
const {db, dbPdf } = require('../databases/db');
require("dotenv").config();
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const slugify = require('slugify');
const session = require('express-session');
const bcrypt = require('bcrypt');
//Import functions
const { isStrongPassword, transporter } = require('../middleware/controlware')

//General Site Page Controller functions
//pdf display with slug
exports.displayPdf = (req, res) => {
  const slug = req.params.slug;  
    db.get('SELECT * FROM pdfs WHERE slug = ?', [slug], (err, pdf) => {
    if (err || !pdf) return res.status(404).send('PDF not found');
        db.all(`SELECT * FROM comments WHERE pdf_id = ?`, [pdf.id], (err, comments) => {
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
            db.all('SELECT * FROM pdfs WHERE slug != ? LIMIT 10', [slug], (err2, related) => {
        // console.log(related)
        console.log(pdf.id)
          db.all(`
              SELECT tags.name FROM tags JOIN pdf_tags ON tags.id = pdf_tags.tag_id
              WHERE pdf_tags.pdf_id = ?`, [pdf.id], (err, rows) => {
                  if (err) return console.error('Error fetching tags:', err.message)
                  const tagNames = rows.map(row => row.name) 
              // console.log(tagNames)
              db.get(`SELECT * FROM users WHERE username = ?`, [pdf.uploaded_by], (err, user) => {
                  res.render('projects', { pdf, related, comments, tagNames, user });
              })
              
              })        
      })
    }
    });
  });
};
//display random pdf
exports.randPdf = (req, res) => {
  db.get('SELECT MAX(id) AS maxID FROM pdfs', (err, row) => {
    if (err) return console.error(err.message)
    const max = row.maxID
    function tryRandom() {
      const myInt = Math.floor(Math.random() * (max)) + 1;
      console.log(myInt)
      db.get('SELECT * FROM pdfs WHERE id = ?', [myInt], (err, row2) => {
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
};

//query controls (consider separate controller file if building out this functionality)
exports.searchGen = (req, res) => {
  const { query } = req.body
  const queryTrim = query.trim()
  searchTerm = '%' + queryTrim + '%'
  res.redirect(`/search?query=${encodeURIComponent(searchTerm)}`)
  // console.log('path = ' +req.path)
};

exports.searchGen2 = (req, res) => {
  const searchTerm = req.query.query;
  const username = req.session.user ? req.session.user.username : 'Guest';
  db.all(`
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
      pdfs.uploaded_at LIKE ? OR
      pdfs.authors LIKE ?
    GROUP BY pdfs.id
    ORDER BY 
      title_match DESC,
      tag_match_count DESC
  `, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm], (err, rows) => {
    if (err) return console.error(err);
    // if (rows) results.push(rows)
    console.log({ items: rows, searchTerm }); // display ordered results
    res.render('index', { items: rows, searchTerm, username })
    // res.json(rows)
  })
}


//comment controls (consider separate controller for advanced commenting features)
exports.pdfComment = (req, res) => {
    const slug = req.params.slug;
    console.log(slug)
    const username = req.session.user.username;
    console.log(username)
    const { comment } = req.body;
    db.get(`SELECT * FROM pdfs WHERE slug = ?`, [slug], (err, pdf) => {
        console.log(pdf.id)
        db.run(
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
};

exports.feedbackDisplay = (req, res) => {
    const slug = req.params.slug;  
    db.get('SELECT * FROM prepublish WHERE slug = ?', [slug], (err, pdf) => {
    if (err || !pdf) return res.status(404).send('PDF not found');
      // GET COMMENTS
      db.all(`SELECT * FROM feedblack WHERE pdf_id = ?`, [pdf.id], (err, coms) => {
        console.log(coms)
        res.render('pdf-viewer', { pdf, coms });
      })
            
      })
    }

exports.subject = (req, res) => {
  const slug = req.params.slug
  console.log(slug)
  const safeSlug = slug.trim().toLowerCase().replace(/-/g, " ")
  db.get(`SELECT * FROM tags WHERE LOWER(name) = ?`, [safeSlug], (err, tag) => {
    if (!tag) return res.send('No submissions yet tagged with that subject.')
      const id = tag.id;
    console.log('tag id = ' + id)
    db.all(`SELECT pdf_tags.pdf_id from pdf_tags WHERE tag_id = ?`,[id], (err, pdfIds) => {
      if (err) return res.send(err)
        else if (!pdfIds) return res.send('No documents remaining with that tag')
      else {
        console.log('pdf id = ' + pdfIds)
        const IDlist = pdfIds.map(obj => obj.pdf_id)
        console.log(IDlist)
        const placeholders = IDlist.map(() => '?').join(', '); 
        console.log(placeholders)
        const query = `SELECT * FROM pdfs WHERE id IN (${placeholders})`
        db.all(query, IDlist, (err, pdfs) => {
          console.log(pdfs)
          const info = { title: safeSlug }
          res.render('subject', { pdfs, info }) //safeSlug)
      })
      }
    })
  })
}

exports.subjectDefault = (req, res) => {
  db.all(`SELECT pdfs.id from pdfs`, (err, pdfIds) => {
      if (err) return res.send(err)
        else if (!pdfIds) return res.send('No documents remaining with that tag')
      else {
    const num = pdfIds.length
    let IDlist = []
    if (num < 10) IDlist = pdfIds.map(obj => obj.id)
    else {
      const randomIds = new Set();
      while (randomIds.size < 10) {
        const randomIndex = Math.floor(Math.random() * num);
        randomIds.add(pdfIds[randomIndex].id);
      }
      IDlist = Array.from(randomIds);
    }
        console.log('pdf id = ' + pdfIds)
        console.log(IDlist)
        const placeholders = IDlist.map(() => '?').join(', '); 
        console.log(placeholders)

        const query = `SELECT * FROM pdfs WHERE id IN (${placeholders})`
        db.all(query, IDlist, (err, pdfs) => {
          console.log(pdfs)
          safeSlug = 'Try a random subject!'
          const info = { title: safeSlug }
          res.render('subject', { pdfs, info }) //safeSlug)
        })
      }
    })
}

exports.searchSubject = (req, res) => {
  const { query, originals, methods, reviews, reproductions } = req.body; 
  // console.log(query, originals, methods, reviews)
  if (methods) console.log('true')
    else console.log('false')
  const searchTerm = '%' + query + '%'
  // const username = req.session.user ? req.session.user.username : 'Guest';
  db.all(`
    SELECT 
      pdfs.*, 
      COUNT(DISTINCT tags.id) AS tag_match_count,
      (CASE WHEN pdfs.title LIKE ? THEN 1 ELSE 0 END) AS title_match
    FROM pdfs
    LEFT JOIN pdf_tags ON pdfs.id = pdf_tags.pdf_id
    LEFT JOIN tags ON pdf_tags.tag_id = tags.id
    WHERE 
      pdfs.title LIKE ? OR 
      tags.name LIKE ? 
    GROUP BY pdfs.id
    ORDER BY 
      title_match DESC,
      tag_match_count DESC
  `, [searchTerm, searchTerm, searchTerm], (err, pdfs2) => {
    if (err) return console.error(err);
    // if (rows) results.push(rows)
    let types = []
    if (originals) types.push(1) // Original
    if (methods) types.push(2) // Method
    if (reviews) types.push(3) // Review
    if (reproductions) types.push(4) // Reproduction
    const pdfs = pdfs2.filter(pdf => types.includes(pdf.type))
    const info = { title: query }
    console.log( JSON.parse(pdfs[0].authors) ); // display ordered results
    // console.log(JSON.parse(pdfs[0].authors))
    res.render('subject', { pdfs, info })
  })
}

exports.jobs = (req, res) => {
  db.all(`SELECT * FROM jobs`, (err, jobs) => {
    if (err) return console.error(err);
    if (!jobs || jobs.length === 0) {
      jobs = [{
        id: 0,
        title: 'Not actively hiring positions',
        username: '',
        description: '',
        reqs: '',
        contact: '',
        pdf: '',
        active: 0
      }]
    }
    res.render('jobs', { jobs })
  })
}

exports.jobsSearch = (req, res) => {
    const {search} = req.body
  search2 = '%' + search + '%'
  console.log(search)
  db.all(`SELECT * FROM jobs WHERE
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
}

exports.viewJob = (req, res) => {
    const id = req.params.id
      db.get(`
    SELECT * FROM jobs WHERE id = ?`, [id], (err, job) => {
      if (err) return res.error(err)
      if (!job) return res.send('No job found with that id')
        console.log(job)
      res.json(job) 
    })
  }

  exports.jobsPost = (req, res) => { 
        if (!req.file) {
        return res.status(400).send('No file uploaded. Check multer.')
    }
  const { title, desc, reqs, contact } = req.body;
  const username = req.session.user.username
  // const slug = slugify(title, { lower: true, strict: true });
  const filename = req.file.filename; //req.file.originalname

  db.run(
    'INSERT INTO jobs (username, title, description, reqs, contact, pdf) VALUES (?, ?, ?, ?, ?, ?)',
    [username, title, desc, reqs, contact, filename],
    function (err) {
      if (err) {
        console.error(err);
        return res.send('Error uploading PDF.');
      }
      res.json({ success: true, title: title, username: username, description: desc,
         reqs: reqs, contact: contact, filename: filename, id: this.lastID });;
    });
  }

exports.jobsDelete = (req, res) => {
    const pdfId = req.params.id;
  
    // Optionally check that the current user owns the file
      db.get(`SELECT * FROM jobs WHERE id = ?`, [pdfId], (err, row) => {
          if (row.username !== req.session.user.username && row.username !== process.env.ADMIN) {
              return res.status(403).send('Forbidden');
          }
    // console.log(row)
        const filePath = path.join(__dirname, 'public', 'pdfs', path.basename(row.pdf));
        // console.log(filePath)       
            db.run(`DELETE FROM jobs WHERE id = ?`, [pdfId], function (err) {
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
    }
