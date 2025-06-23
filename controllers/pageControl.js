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
const { isStrongPassword } = require('../middleware/controlware')

//General Site Page Controller functions

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
// search limits


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


