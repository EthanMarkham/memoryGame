const jwt = require("jsonwebtoken");
const config = require('../config/config.json');
const User = require("../model/user.model");

exports = module.exports = function (io, gameManager) {
  //set up auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    let userID = null
    if (token) {
      jwt.verify(token, config.secret, async (err, decoded) => {
        if (!err) userID = decoded.user.id
      })
    }
    if (!token || !userID) socket.error = { type: "auth", message: "auth failed" }
    else socket.userID = userID
    next()
  })

  io.on('connection', (socket) => {

    socket.on("listGames", () => joinGameList(socket))

    socket.on("addGame", (gameInfo) => {
      User.findById(socket.userID)
      .then(user => gameManager.NewGame(user, gameInfo.playerCount))
      .then(() => joinSuccess(socket))
      .catch(err => socket.emit('error', err.message))
    })

    socket.on("joinGameChannel", () => {
      joinChannel(socket)
      .catch(err => socket.emit('error', err.message))
    })
    socket.on("click", (guess) => {
      gameManager.HandleClick(socket.userID, guess.index)
      .then(() => broadCastGameInfo(socket.userID))
      .then(() => checkReset(socket.userID))
      .catch(err => socket.emit('error', err.message))
    })
    socket.on('disconnecting', () => { console.log(socket.rooms) });
  })

  //HELPER FUNCTIONS TO MAKE ^^^ CLEANER
  function broadCastGameInfo(userID) {
    game = gameManager.GetClientInfo(userID).game
    io.to(`game:${game.id}`).emit('gameInfo', game)
  }
  function broadCastOpenGames() {
    const openGames = gameManager.GetOpenGames()
    io.to('games').emit('games', openGames)
  }
  function checkReset(userID){
    let gameInfo = gameManager.GetGameInfo(userID)
    if (gameInfo.game.resetting) return gameManager.ResetCards(userID).then(() => broadCastGameInfo(userID))
    else return
  }
  function joinChannel(socket) {
    return new Promise((resolve) => { 
      let gameInfo = gameManager.GetGameInfo(socket.userID)
      socket.join(`game:${gameInfo.game.id}`)
      broadCastGameInfo(socket.userID)
      resolve()
    })
  }
  function joinSuccess(socket){
    return new Promise((resolve) => { 
      socket.emit('joinSuccess', true)
      broadCastOpenGames()
      resolve()
    })
  }
  function joinGameList(socket){
    return new Promise((resolve) => { 
      socket.join('games')
      broadCastOpenGames()
      resolve()
    })
  }
}
      /*
socket.on('chat mounted', function(user) {
// TODO: Does the server need to know the user?
socket.emit('receive socket', socket.id)
})
socket.on('leave channel', function(channel) {
socket.leave(channel)
})
socket.on('join channel', function(channel) {
socket.join(channel.name)
})
socket.on('new message', function(msg) {
socket.broadcast.to(msg.channelID).emit('new bc message', msg);
});
socket.on('new channel', function(channel) {
socket.broadcast.emit('new channel', channel)
});
socket.on('typing', function (data) {
socket.broadcast.to(data.channel).emit('typing bc', data.user);
});
socket.on('stop typing', function (data) {
socket.broadcast.to(data.channel).emit('stop typing bc', data.user);
});
socket.on('new private channel', function(socketID, channel) {
socket.broadcast.to(socketID).emit('receive private channel', channel);
})
*/

