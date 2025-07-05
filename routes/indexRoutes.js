const {Router} = require('express');
const {upload, uploadPdf} = require('../middleware/multerware')
const { requireAuth } = require('../middleware/middleware.js')
// const {route} = require('express/lib/application');


//Import all controller files
const auth = require('../controllers/authControl.js');
const pg = require('../controllers/pageControl.js');
const store = require('../controllers/storageControl.js');

//Index routes
const routes = Router();

//Defined routes

//Users and authentication
//guest user page
routes.get('/', auth.guest);
//new user
routes.get('/newuser', auth.newUser);
//user registration
routes.get('/register', auth.register);
routes.post('/register', auth.registerPassword);
//user verification
routes.get('/verify/:token', auth.verifyUser);
routes.post('/reverify', auth.reverifyUser);
//user login
routes.get('/login', auth.login);
routes.post('/login', auth.loginMain);
routes.post('/login2', auth.loginIndexPg);
//user profile/dashboard page
routes.get('/dashboard', requireAuth, auth.dashboard);
//user logout
routes.post('/logout', auth.logoutErr);

//General page controls
//dynamic page routing?
//routes.get('/pages/:slug', pg.pageRoute);
//display pdf
routes.get('/pdf/:slug', pg.displayPdf);
//display random pdf
routes.get('/random', pg.randPdf);
//search routing
routes.post('/search', pg.searchGen);
routes.get('/search', pg.searchGen2);
routes.post('/search-subject', pg.searchSubject)
//comment routing
routes.post ('/add-comment/:slug', requireAuth, pg.pdfComment);

//Site storage controls
//image storing
routes.post('/upload-image', upload.single('image'), store.imgUpload);
//pdf storing
routes.post('/upload-pdf', requireAuth, uploadPdf.single('pdf'), store.pdfUpload);
//user deletion of file(s)
routes.delete('/pdf/delete/:id', requireAuth, store.deletePdf);
routes.post('/pdf/edit/:id', requireAuth, uploadPdf.single('pdf'), store.editPdf)
routes.post('/upload-prepublish', requireAuth, uploadPdf.single('pdf'), store.newReview)
routes.get('/feedback/:slug', requireAuth, pg.feedbackDisplay)
routes.post('/submit-comments/:id', requireAuth, store.submitComment)
routes.get('/subject/:slug', pg.subject)
routes.get('/subject', pg.subjectDefault);
//jobs
routes.get('/jobs', pg.jobs);
routes.post('/jobs', requireAuth, pg.jobsSearch);
routes.get('/job/:id', pg.viewJob);
routes.post('/post-job', requireAuth, uploadPdf.single('pdf'), pg.jobsPost);
routes.delete('/jobs/delete/:id', requireAuth, pg.jobsDelete);
routes.delete('/feedback/delete/:id', requireAuth, store.feedbackDelete); 

//claps and subs
routes.post('/give-claps', requireAuth, store.giveClap)
routes.post('/follow', requireAuth, store.followUser)
routes.get('/isfollowing/:user', requireAuth, store.isFollowing)

//End of indexRoutes.js
module.exports = routes;

