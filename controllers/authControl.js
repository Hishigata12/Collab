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


//Authentication Controller functions

//guest user page
exports.guest =(req, res) => {
    const username = req.session.user ? req.session.user.username : 'Guest';
    res.render('index', { username })
};

//new user
exports.newUser =(req, res) => {
    res.render('newuser')
};

//register user
exports.register = (req, res) => {
    res.render('register');
};

exports.registerPassword = async (req, res) => {
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
}

//user verification
exports.verifyUser = (req, res) => {
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
    };

//reverify user
exports.reverifyUser = (req, res) => {
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
};

//login user
exports.login = ( req, res) => {
    res.render('login')
};
//main user login page route
exports.loginMain = async (req, res) => {
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

    // const user = users.find(u => u.username --- username)
    // if (!user) return res.status(401).send('User not found')

    // const match = await bcrypt.compare(password, user.password);
    // if (!match) return res.status(401).send('Incorrect password')
    
    // req.session.user = user.username
    // res.redirect('/dashboard')
};

//login route from index/other page
exports.loginIndexPg = async (req, res) => {
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
};

//user profile/dashboard page
exports.dashboard = async (req, res) => {
//check if this code works! Ashley soln to adding middleware    
    app.use(requireAuth);
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
        res.render('dashboard', { username, pdf })
    })
};

//user logout
exports.logoutErr = (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send("Couldn't log out")
        res.redirect('/')
    })
};