const express = require('express');
const path = require('path');
const logger = require('morgan');
const cors = require('cors')
const config = require('./config/config.json');
const serverUtils = require('./utils/serverUtil');
// Initiate Mongo Server
require('./utils/dbutil');
const usersRouter = require('./routes/user');
const adminRouter = require('./routes/admin');

var app = express(),
  server = require('http').createServer(app),
  session = require("express-session")({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true
  })

app.use(cors());
app.use(session);

//socket stuff
const sharedsession = require("express-socket.io-session");

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
})
io.use(sharedsession(session));
require('./routes/socket')(io)

//Sends json so that it looks good
app.set('json spaces', 2)

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

//route to static files
app.use(express.static('public'))

//routes
app.use(serverUtils.postTrimmer); //trip post data white space
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter)
app.get('*', (req, res) => res.sendFile('index.html', {root: __dirname+'/public'}));

//app.use(express.static(path.join(__dirname, 'client/build')))

//Errors
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err);
});
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

module.exports = { app: app, server: server, session: session };
