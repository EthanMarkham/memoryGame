const express = require('express');
const path = require('path');
const logger = require('morgan');
const cors = require('cors')
const config = require('./config/config.json');

// Initiate Mongo Server
require('./config/database.config')
const usersRouter = require('./routes/user');
const adminRouter = require('./routes/admin');

var app = express(),
    server = require('http').createServer(app),
    session = require("express-session")({
      secret: config.sessionSecret,
      resave: true,
      saveUninitialized: true
    }),
    sharedsession = require("express-socket.io-session");

app.use(cors())
app.use(session);

//socket stuff
const SocketController = require('./controllers/socket.controller')
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
    }
})
io.use(sharedsession(session));
io.on('connection', (socket) => {
  socket.emit('connected')
  socket.on("ADD_GAME", gameInfo => SocketController.handleAddGame(socket, io, gameInfo))
  socket.on("ADD_ME_TO_GAME", gameID => SocketController.handleJoinGame(socket, io, gameID))
  socket.on("GAME_CLICK", guess => SocketController.handleGameClick(socket, io, guess))
  socket.on("GET_GAME", _ => SocketController.getGame(socket, io))
  socket.on("GET_STATUS", _ => SocketController.handleCheckUserStatus(socket))
  socket.on("LIST_GAMES", _ => SocketController.joinGameList(socket))
  socket.on("LOGIN", token => SocketController.handleLogin(socket, token))
  socket.on("LOGOUT", _ => SocketController.handleLogout(socket))
  socket.on("QUIT_GAME", gameID => SocketController.handleQuitGame(socket, io, gameID))
  socket.on('disconnecting', () => { console.log(socket.rooms) })
})
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
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter) 
//app.use(express.static(path.join(__dirname, 'client/build')))

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

module.exports = { app: app, server: server }; 
