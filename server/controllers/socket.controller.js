const jwt = require("jsonwebtoken");
const config = require('../config/config.json');
const GameController = require("./game.controller")

module.exports.handleAddGame = (socket, io, newGameInfo) => {
  console.log(socket.handshake.session.userID, newGameInfo)
  GameController.NewGame(socket.handshake.session.userID, newGameInfo)
    .then(newGame => {
      socket.join(`game:${newGame.id}`)
      if (newGame.users.length < newGame.playerCount) io.to(`games`).emit('GAME_LIST', GameController.GetOpenGameInfo())
      socket.emit('USER_STATUS', { game: true }) //client catches status and asks for games
    }).catch(err => { console.log(err); socket.emit('ERROR', err.message) })
}
module.exports.handleCheckUserStatus = (socket) => {
  GameController.GetClientInfo(socket.handshake.session.userID)
    .then(gameInfo => {
      socket.join(`game:${gameInfo.id}`)
      socket.leave('games') //in game so no longer in this room
      socket.emit('USER_STATUS', { game: true })
    })
    .catch(_ => {
      socket.join('games')
      socket.emit('USER_STATUS', { game: false })
    })
}
module.exports.handleGameClick = (socket, io, guess) => {
  console.log('Clicking......')
  GameController.HandleClick(socket.handshake.session.userID, guess)
    .then(game => {
      if (game.resetting) {
        broadcastGameInfo(io, game) //broadcast new cards
        GameController.ResetCards(game.id) //resolves after 3000 ms
          .then(game => broadcastGameInfo(io, game)) //broadcast reset
          .catch(err => { console.log(err); socket.emit('ERROR', err.message) })
      }
      else broadcastGameInfo(io, game)
    })
    .catch(err => { console.log(err); socket.emit('ERROR', err.message) })
}
module.exports.handleJoinGame = (socket, io, gameID) => {
  console.log('Joining Game')
  GameController.AddUser(socket.handshake.session.userID, gameID)
    .then(gameInfo => {
      socket.join(`game:${gameInfo.id}`)
      socket.leave('games') //in game so no longer in this room
      socket.emit('USER_STATUS', { game: true })
      if (gameInfo.users.length < gameInfo.playerCount) io.to(`games`).emit('GAME_LIST', GameController.GetOpenGameInfo())
    })
    .catch(err => { console.log(err); socket.emit('ERROR', err.message) })
}
module.exports.handleQuitGame = (socket, io, gameID) => {
  GameController.RemoveUser(socket.handshake.session.userID)
    .then(gameData => {
      socket.leave(`game:${gameID}`)
      socket.emit('USER_STATUS', { game: false })
      if (!gameData.deleted) {
        io.to(`game:${gameData.clientInfo.id}`).emit('GAME_INFO', gameData.clientInfo)
      }
    })
    .catch(err => { console.log(err); socket.emit('ERROR', err.message) })
}
module.exports.joinGameList = socket => {
  socket.join('games')
  socket.emit('GAME_LIST', GameController.GetOpenGameInfo())
}
module.exports.handleLogin = (socket, token) => {
  let userID
  if (token) {
    jwt.verify(token, config.secret, async (err, decoded) => {
      if (!err) userID = decoded.user.id
      else console.log(err)
    })
  }
  if (!token || !userID) {
    console.log('Authentication Error')
    socket.emit('ERROR', "Token Expired")
  }
  else {
    console.log(`${userID} just connected`)
    socket.handshake.session.userID = userID
    socket.handshake.session.save();
    socket.emit('LOGIN_SUCCESS')
  }
}
module.exports.handleLogout = socket => {
  if (socket.handshake.session.userID) {
    delete socket.handshake.session.userID;
    socket.handshake.session.save();
  }
  socket.emit("LOGOUT_SUCCESS")
}
module.exports.getGame = (socket, io) => {
  console.log(socket.handshake.session.userID)
  GameController.GetClientInfo(socket.handshake.session.userID)
  .then(game => {
    io.to(`game:${game.id}`).emit('GAME_INFO', game)
  })
  .catch(err => { console.log(err); socket.emit('ERROR', err.message) })
}

const broadcastGameInfo = (io, game) => io.to(`game:${game.id}`).emit('GAME_INFO', game.ClientInfo())
