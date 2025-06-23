const multer = require('multer')

// Storage
const imageStorage = multer.diskStorage({
    destination: './public/images',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload  = multer({ storage: imageStorage })

const pdfStorage = multer.diskStorage({
    destination: './public/pdfs',
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, 'public/pdf')); // Ensure this path exists!
//   },
   filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const uploadPdf = multer({ storage: pdfStorage });

module.exports = {upload, uploadPdf}