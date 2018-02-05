var express = require('express'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = require('./models/user')
    bodyParser = require('body-parser'),
    localStrategy = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose')

var app = express();
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
mongoose.connect('mongodb://localhost/auth_test');

app.use(require('express-session')({
  secret: 'i live in denver colorado',
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ============ ROUTES ============

app.get('/', function(req, res){
  res.render('home')
})

app.get('/secret', isLoggedIn, function(req, res){
  res.render('secret')
})

// ============ AUTH ROUTES ============

app.get('/register', function(req, res){
  res.render('register')
})

app.post('/register', function(req, res){
  User.register(new User({
    username: req.body.username}),
    req.body.password,
    function(err, user){
      if(err){
        console.log("error creating user", err)
        return res.render('register')
      } else {
        passport.authenticate('local')(req, res, function(){
          res.redirect('/secret')
        })
      }
    })
})

app.get('/login', function(req, res){
  res.render('login')
})

app.post('/login', passport.authenticate('local', {
  successRedirect: '/secret',
  failureRedirect: '/login'
}), function(req, res){
})

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
})

// CHECK USER IS LOGGED IN MIDDLEWARE

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login')
}




app.listen(3000, function(){
console.log('the server has started')
})
