var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var jsonParser = require('body-parser').json();
var db = require('./db');
var control = require('./control');

passport.use(new Strategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(jsonParser);
app.use(require('express-session')({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 2628000000 },
  }));
app.use(express.static('static'))

app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get('/',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res) {
    res.render('home', { user: req.user });
  });

app.get('/login',
  function(req, res) {
    res.render('login');
  });

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout',
  function(req, res) {
    req.logout();
    res.redirect('/');
  });

app.post('/control/light',
  require('connect-ensure-login').ensureLoggedIn(),
  jsonParser,
  function (req, res) {
    if (!req.body) return res.sendStatus(400);
    control.controlLight(req.body.command, req.body.target);
    res.send(req.body);
  });

app.listen(3000);
