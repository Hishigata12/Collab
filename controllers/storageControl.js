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

//Site Storage Controller functions
//image upload and verify
exports.imgUpload = (req, res) => {
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
};

//PDF upload and verify
exports.pdfUpload = (req, res) => {
if (!req.file) {
        return res.status(400).send('No file uploaded. Check multer.')
    }
  const { title, tags, authors, description, unis, type } = req.body;
  console.log(type)
  tagList = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0)
  authorList = authors.split(',').map(author => author.trim().toLowerCase()).filter(author => author.length > 0)
  uniList = unis.split(',').map(uni => uni.trim().toLowerCase()).filter(uni => uni.length > 0)
//   console.log(tagList)
  const slug = slugify(title, { lower: true, strict: true });
//   console.log(req.file)
  const filename = req.file.filename; //req.file.originalname
  dbPdf.run(
    'INSERT INTO pdfs (title, slug, filename, uploaded_by, description, authors, unis, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [title, slug, filename, req.session.user.username, description, authorList, uniList, type],
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
      res.json({ success: true, title: title, slug: slug, id: pdfId });;
    });
};


//user deletes file(s)
exports.deletePdf = (req, res) => {
  const pdfId = req.params.id;

  // Optionally check that the current user owns the file
    dbPdf.get(`SELECT * FROM pdfs WHERE id = ?`, [pdfId], (err, row) => {
        if (row.uploaded_by !== req.session.user.username && row.uploaded_by !== process.env.ADMIN) {
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
};

exports.editPdf = (req, res) => {
        const pdfId = req.params.id;
        console.log(`ID = ${pdfId}`)
  // Optionally check that the current user owns the file
         dbPdf.get(`SELECT * FROM pdfs WHERE id = ?`, [pdfId], (err, row) => {
        if (err) return console.error(err.message)
        console.log(row)
        if (row.uploaded_by !== req.session.user.username && row.uploaded_by !== process.env.ADMIN) {
            return res.status(403).send('Forbidden');
        }
      
        const { description } = req.body;
        // if (req.file) { const filename = req.file.filename}
        console.log(`description ${description}`)
        if (description) {
            dbPdf.run(`
            UPDATE pdfs SET description = ? WHERE id = ?`, [description, pdfId], function (err) {
                if (err) {
                console.error("Database update error:", err.message);
                return res.status(500).json({ success: false, error: err.message });
                }
            })
        }
        if (req.file) {
            const filename = req.file.filename
            console.log(filename)
                dbPdf.run(`
                UPDATE pdfs SET filename = ? WHERE id = ?`, [filename, pdfId], function (err) {
                if (err) {
                console.error("Database update error:", err.message);
                return res.status(500).json({ success: false, error: err.message });
                }
            })
        }
      })

}

exports.newReview = (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.')
    }
  const { title, description, type } = req.body;
  console.log(type)
//   console.log(tagList)
  const slug = slugify(title, { lower: true, strict: true });
//   console.log(req.file)
  const filename = req.file.filename; //req.file.originalname
  dbPdf.run(
    'INSERT INTO prepublish (title, slug, filename, uploaded_by, description, type) VALUES (?, ?, ?, ?, ?, ?)',
    [title, slug, filename, req.session.user.username, description, type],
    function (err) {
      if (err) {
        console.error(err);
        return res.send('Error uploading PDF.');
      }
      const pdfId = this.lastID
      res.json({ success: true, title: title, slug: slug, id: pdfId });;
    });
};

exports.submitComment = (req, res) => {
    const comments = req.body
    const user = req.session.user.username
    comments.forEach(comment => {
    const { pdf_id, pagenum, x, y, msg } = comment
    dbPdf.run(`INSERT INTO feedblack (pdf_id, x, y, text, page_number, created_by)
        VALUES (?, ?, ?, ?, ?, ?)`, [pdf_id, x, y, msg, pagenum, user], function (err) {
            if (err) {
                console.error(err)
                // return res.json({success: false})
            } 
        })
    })
}