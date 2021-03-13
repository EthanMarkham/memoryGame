const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')

// Initiate Mongo Server
require('./config/database.config')

const gameManager = require('./modules/gameManager').GameManager()
const usersRouter = require('./routes/user');

var app = express();
const server = require('http').createServer(app); 

// enable Cross-Origin Resource Sharing
app.use(cors())

//socket stuff
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
    }
})
require('./controllers/socket.controller')(io, gameManager);

//Sends json so that it looks good
app.set('json spaces', 2)

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());

//route to static files
app.use(express.static('public'))

//routes
app.use('/api/users', usersRouter);
app.use(express.static(path.join(__dirname, 'client/build')))

//Errors
app.use(function(req, res, next) {
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

module.exports = { app: app, server: server, gameManager: gameManager }; 
