const {Router} = require('express');
const {route} = require('express/lib/application');
const multer = require('multer');


//Import all controller files
const auth = require('../controllers/authController');

//Index routes 
const routes = Router();

//Defined routes

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


//End of indexRoutes.js
module.exports = routes;