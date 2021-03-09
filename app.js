var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')

// Initiate Mongo Server
require('./config/config')


var gameRouter = require('./routes/game')
//var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user');

var app = express();

// enable Cross-Origin Resource Sharing
app.use(function (reg, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE')
  next()
})

//Sends json so that it looks good
app.set('json spaces', 2)

//set up session
app.use(session({
  name: 'server-session-cookie-id',
  secret: 'my express secret',
  saveUninitialized: true,
  resave: true,
    cookie: {
      secure: false,
      maxAge: 2160000000,
      httpOnly: false
  }
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());

//route to static files
app.use(express.static('public'))


//set api rout
app.use('/api/game', gameRouter);
//route to users
app.use('/api/users', usersRouter);
//route to react
app.use(express.static(path.join(__dirname, 'client/build')))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500)

  //send json error
  res.json({
    "error": {
      "message": err.message,
      "status": err.status
    }
  })
})

module.exports = app;