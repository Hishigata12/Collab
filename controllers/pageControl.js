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
};
//display random pdf
exports.randPdf = (req, res) => {
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
};

//query controls (consider separate controller file if building out this functionality)
exports.searchGen = (req, res) => {
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
};

//comment controls (consider separate controller for advanced commenting features)
exports.pdfComment = (req, res) => {
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
};

exports.feedbackDisplay = (req, res) => {
    const slug = req.params.slug;  
    dbPdf.get('SELECT * FROM prepublish WHERE slug = ?', [slug], (err, pdf) => {
    if (err || !pdf) return res.status(404).send('PDF not found');
      // GET COMMENTS
      dbPdf.all(`SELECT * FROM feedblack WHERE pdf_id = ?`, [pdf.id], (err, coms) => {
        console.log(coms)
        res.render('pdf-viewer', { pdf, coms });
      })
            
      })
    }