const path = require('path');
const fs = require('fs');
const {db, dbPdf } = require('./databases/db');
require("dotenv").config();
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const slugify = require('slugify');
const session = require('express-session');
const bcrypt = require('bcrypt');
const multer = require('multer');

// Storing images and pdfs using multer
const imageStorage = multer.diskStorage({
destination: './public/images',
filename: (req, file, cb) => {
cb(null, Date.now() + path.extname(file.originalname))
}
});

const upload = multer({ imageStorage });

const pdfStorage = multer.diskStorage({
destination: './public/pdfs',
// destination: function (req, file, cb) {
// cb(null, path.join(__dirname, 'public/pdf')); // Ensure this path exists!
// },
filename: function (req, file, cb) {
const uniqueName = Date.now() + '-' + file.originalname;
cb(null, uniqueName);
}
});

const uploadPdf = multer({ storage: pdfStorage });

//Site Storage Controller functions
// requires middleware
// //exports.imgUpload=