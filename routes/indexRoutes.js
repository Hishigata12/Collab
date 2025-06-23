const {Router} = require('express');
const {route} = require('express/lib/application');


//Import all controller files
const auth = require('../controllers/authControl.js');
const pg = require('../controllers/pageControl.js');
const store = require('../controllers/storageControl.js');

//!!Import all middleware files

//Index routes 
const routes = Router();

//Defined routes

//Users and authentication
//guest user page
route.get('/', auth.guest);
//new user
route.get('/newuser', auth.newUser);
//user registration
route.get('/register', auth.register);
route.post('/register', auth.registerPassword);
//user verification
route.get('/verify/:token', auth.verifyUser);
route.post('/reverify', auth.reverifyUser);
//user login
route.get('/login', auth.login);
route.post('/login', auth.loginMain);
route.post('/login2', auth.loginIndexPg);
//user profile/dashboard page
route.get('/dashboard', auth.dashboard);
//user logout  
route.post('/logout', auth.logoutErr);

//General page controls
//search routing
routes.post('/search', pg.searchGen);


//comment routing
//!! middleware required
//routes.post ('/add-comment/:slug', requireAuth, pg.pdfComment);

//Site storage controls
//image storing
//!!requires middleware
//route.post('/upload-image', upload.single('image'), store.imgUpload);
//pdf storing
//!!two middleware
//route.post('/upload-pdf', requireAuth, uploadPdf.single('pdf'), store.pdfUpload);)
//user deletion of file(s)
routes.delete('/pdf/:id', store.deletePdf);

//End of indexRoutes.js
module.exports = routes;