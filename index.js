//get dotenv ready to work, will read the file and stick in process environment
require('dotenv').config();
var express = require('express');
var ejsLayouts = require('express-ejs-layouts');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
//var cookieParser = require('cookieParser');
var session = require('express-session');
var flash = require('connect-flash');
// require the authorization middleware at the top of the page
var isLoggedIn = require('./middleware/isLoggedIn');
// this sets a static directory for the views
app.use(express.static(path.join(__dirname, 'static')));


app.set('view engine', 'ejs');
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(ejsLayouts);

/*
 * setup the session with the following:
 *
 * secret: A string used to "sign" the session ID cookie, which makes it unique
 * from application to application. We'll hide this in the environment
 *
 * resave: Save the session even if it wasn't modified. We'll set this to false
 *
 * saveUninitialized: If a session is new, but hasn't been changed, save it.
 * We'll set this to true.
 */
//app.use(express.cookieParser('your secret here'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(flash());

app.use(function(req, res, next) {
  // before every route, attach the flash messages and current user to res.locals
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});

//this lines must occur after the session is configured
var passport = require('./config/ppConfig');
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res) {
  res.render('index');
});
//here we limit eccess to this page only for authorized people
app.get('/profile', isLoggedIn, function(req, res) {
  res.render('profile');
});


app.use('/auth', require('./controllers/auth'));
app.use('/item', require('./controllers/item'));
app.use('/list', require('./controllers/list'));


var server = app.listen(process.env.PORT || 3000);

module.exports = server;
