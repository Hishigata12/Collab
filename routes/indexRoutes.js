const {Router} = require('express');
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
//dynamic page routing
routes.get('/pages/:slug', pg.pageRoute);

//Site storage controls
//image storing
// requires middleware
// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session.user) {
    next()
    } else {
    res.redirect('/login')
    }
}
//route.post('/upload-image', store.imgUpload);

//End of indexRoutes.js
module.exports = routes;