
require("dotenv").config()
nodemailer = require('nodemailer')

function isStrongPassword(pw) {
    return pw.length >= 8 &&
    /[a-z]/.test(pw) &&
    /[A-Z]/.test(pw) &&
    /\d/.test(pw);
}

const transporter = nodemailer.createTransport({
  service: 'gmail', // or use SMTP for better control
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAILPW
  }
});

module.exports = { isStrongPassword, transporter }