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

//Authentication Controller functions and vars
jwtSecret = process.env.secretKey
BASE_URL = process.env.BASE_URL

//guest user page
exports.guest =(req, res) => {
    const username = req.session.user ? req.session.user.username : 'Guest';
    admins = process.env.ADMINS
    console.log('Testing index route')
    db.all(`SELECT * FROM features`, [],  (err, features) => {
        if (err) return res.send('fucked up bro')
            db.all(`SELECT * FROM news ORDER BY time DESC LIMIT 10`, (err, news) => {
        if (err) return res.send('no news bro')
            res.render('index', { username, items: [], admins, features, news })
        })
        
    })
    
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
     db.run(`INSERT INTO users (username, password, email) VALUES (?, ?, ?)`, [username, hashed, email], function(err)  {
    if (err) return res.send('User already exists.');
    const userId = this.lastID
    console.log(`user ID: ${userId}`)
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

//reverify user
exports.reverifyUser = (req, res) => {
    const { email } = req.body
        db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
            if (err) {
                console.error('Database error:', err.message)
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
        console.log(user)
        req.session.user = { username: user.username, id: user.id, email: user.email, subs: user.subs }
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
        console.log(user)
        req.session.user = { username: user.username, id: user.id, email: user.email, subs: user.subs }
        res.redirect('/')
      })
    
    // res.redirect('/dashboard');
  });
};

//user profile/dashboard page
exports.dashboard = async (req, res) => {
    // const username = req.session.user.username
    const user = req.session.user
    console.log(req.session.user)
    // console.log(username)
    db.serialize(() => {
     db.all(`
        SELECT * FROM pdfs WHERE uploaded_by = ?`, [user.username], (err, pdf) => {
            if (err || !pdf) {
                console.log('choke')
                pdf = [{
                    title: '',
                    filename: '',
                    uploaded_at: '',
                    uploaded_by: ''
                }]
                return res.send('no PDF found')
            }
            // console.log(pdf)
             db.all(`
              SELECT * FROM jobs WHERE username = ?`, [user.username], (err, jobs) => {
                if (err || !jobs.length === 0) {
                  jobs = [{
                    id: 0,
                    title: '',
                    username: '',
                    description: '',
                    reqs: '',
                    contact: '',
                    pdf: '',
                    active: 0
                  }]
                }
                   db.all(`
              SELECT * FROM prepublish WHERE uploaded_by = ?`, [user.username], (err, review) => {
                if (err) return res.send(err)
                if (!jobs.length === 0) {
                  review = [{
                    id: 0,
                    title: '',
                    username: '',
                    description: '',
                    reqs: '',
                    contact: '',
                    pdf: '',
                    active: 0, 
                    type: 1,
                  }]
                }
                db.get(`SELECT * FROM users WHERE username = ?`, [user.username], (err, me) => {
                    if (err) {
                        console.error('Error fetching user:', err.message);
                        return res.status(500).send('Failed to fetch user data');
                    }
                    if (!user) {
                        return res.status(404).send('User not found');
                    }
                    // console.log(user)
                    db.all(`SELECT * FROM currentAffs WHERE user_id = ?`, [user.id], (err, caff) => {
                           if (err) {
                        console.error('Error fetching user:', err.message);
                        return res.status(500).send('Failed to fetch user data');
                        }
                        if (!user) {
                            return res.status(404).send('User not found');
                        }
                         db.all(`SELECT * FROM pastAffs WHERE user_id = ?`, [user.id], (err, paff) => {
                           if (err) {
                        console.error('Error fetching user:', err.message);
                        return res.status(500).send('Failed to fetch user data');
                        }
                        if (!user) {
                            return res.status(404).send('User not found');
                        }
                         db.all(`SELECT * FROM linkAffs WHERE user_id = ?`, [user.id], (err, laff) => {
                           if (err) {
                        console.error('Error fetching user:', err.message);
                        return res.status(500).send('Failed to fetch user data');
                        
                        }
                        if (!user) {
                            return res.status(404).send('User not found');
                        }
                         res.render('dashboard', { user, pdf, jobs, review, me, caff, laff, paff })
                    })
                    })
                    })
                })
                
              })
        // res.render('dashboard', { username, pdf })
            })
    })
})
};

//user logout
exports.logoutErr = (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send("Couldn't log out")
        res.redirect('/')
    })
};

exports.makeReport = (req, res) => {
    const user = req.session.user
    if (!user) {
        return res.status(401).send('You must be logged in to report a user');
    }
    console.log(req.body)
    const { data, pdf } = req.body
    console.log(data.reason)
    db.run(`INSERT INTO reports (reported_by, reported, reason) VALUES (?, ?, ?)`,
        [user.username, pdf.id, data.reason], function (err) {
            if (err) {
                console.error('Error inserting report: ', err.message);
                return res.status(500).send('Failed to send report')
            }
            res.json({ success: true, message: 'Report sent successfully' });
        })
}

exports.resolveReport = (req, res) => {
    const id = req.params.id
    const user = req.session.user
    const admins = process.env.ADMINS
    const { resolved } = req.body
    if (!user || !admins.includes(user.username)) {
        return res.status(403).send('You do not have permission to resolve reports')
    }
    let num = 0
    if (!resolved) num = 1
    db.run(`UPDATE reports SET resolved = ${num} WHERE id = ?`, [id], function (err) {
        if (err) {
            console.error('Error resolving report: ', err.message);
            return res.status(500).send('Failed to resolve report')
        }
        res.json({ success: true, message: 'Report resolved successfully' });
    })
}

exports.editProfile = (req, res) => {
    const user = req.session.user
    console.log(req.body)
    const { name, surname, email } = req.body
    let fields = []
    let values = []
    if (name) {
    fields.push('first_name = ?')
    values.push(name)
    }
    if (surname) {
    fields.push('last_name = ?')
    values.push(surname)
    }
    if (email) {
    fields.push('email = ?')
    values.push(email)
    }
    // console.log(user)
    // console.log(fields)
    // console.log(values)
    values.push(user.username)
    if (fields.length > 0) {
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE username = ?`;
    db.run(sql, values, function (err) {
        if (err) {
        console.error("Update failed:", err.message);
        return res.status(500).json({ success: false });
        }
        res.json({ success: true });
    });
    } else {
    res.json({ success: false, message: "No fields provided" });
    } 
}

exports.viewAllUsers = (req, res) => {
    const table = req.params.db
    db.all(`SELECT * FROM ${table}`, (err, row) => {
        console.log(row)
    })
}

exports.addAff = (req, res) => {
    const user = req.session.user.id
    console.log(req.body)
    const { current, past, link } = req.body
    if (current) {
        db.run(`INSERT INTO currentAffs (aff, user_id) VALUES (?, ?)`, [current, user], (err) => {
            if (!err) console.log('Inserted current affiliations ' + current)
        })
    }
    if (past) {
    db.run(`INSERT INTO pastAffs (aff, user_id) VALUES (?, ?)`, [past, user], (err) => {
            if (!err) console.log('Inserted past affiliations ' + past)
        })
    }
    if (link) {
     db.run(`INSERT INTO linkAffs (link, user_id) VALUES (?, ?)`, [link, user], (err) => {
            if (!err) console.log('Inserted links ' + link)
        })
    }
    res.json({ success: true })
    
}

exports.updateBadge = (req, res) => {
    const user = req.session.user.id
    console.log(user)
    const { location, site } = req.body || { location: 'The Abyss', site: 'doodoos' }
    console.log(req.body)
    console.log(req.file)
    const avatar = req.file ?  `/images/${req.file.filename}` : '/images/cow.jfif'
      const sql = `
    INSERT INTO profiles (user_id, website, avatar, location)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id)
    DO UPDATE SET avatar = excluded.avatar,
    website = excluded.website,
    location = excluded.location
  `;
    db.run(sql, [user, site, avatar, location], function (err) {
        if (err) {
            console.error('Error updating profile:', err.message);
            return res.status(500).json({ success: false, message: 'Failed to update profile' });
        }
        console.log('Profile updated successfully');
        res.json({ success: true, message: 'Profile updated successfully', avatar, site, location });
    })
}


function createSql(body, user) {
     let fields = []
    let values = []
    body.forEach(b => {
        if (b) {
            fields.push()
        }

})
}