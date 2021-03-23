const jwt = require("jsonwebtoken");
const config = require('../config/config.json');
const User = require("../model/user.model");

exports = module.exports = function (io, gameManager) {
  io.on('connection', (socket) => {
    socket.emit('connected')

    socket.on("LIST_GAMES", () => handleListGames())
    socket.on("ADD_GAME", gameInfo => handleAddGame(gameInfo))
    socket.on("GET_STATUS", () => handleCheckUserStatus(socket))
    socket.on("JOIN_GAME", () => handleJoinChannel(socket))
    socket.on("GET_GAME", () => broadCastGameInfo(socket))
    socket.on("LEAVE_GAME", (gameID) => handleLeaveGame(socket, gameID))
    socket.on("GAME_CLICK", (guess) => handleGameClick(socket, guess))

    socket.on("LOGIN", (token) => handleLogin(token))
    socket.on("LOGOUT", () => handleLogout())

    socket.on('disconnecting', () => { console.log(socket.rooms) })

    //HELPER FUNCTIONS TO MAKE ^^^ CLEANER
    const handleJoinChannel = () => {
      console.log('Join Request')
      gameManager.GetClientInfo(socket.handshake.session.userID)
        .then(gameInfo => { socket.join(`game:${gameInfo.id}`) })
        .then(() => socket.emit('JOIN_SUCCESS'))
        .then(() => broadCastOpenGames())
        .catch(err => socket.emit('JOIN_ERROR', err.message))
    }
    const handleAddGame = (newGameInfo) => {
      if (socket.handshake.session.userID) {
        User.findById(socket.handshake.session.userID)
          .then(user => gameManager.NewGame(user, newGameInfo.playerCount))
          .then(gameInfo => { socket.join(`game:${gameInfo.id}`) })
          .then(() => socket.emit('JOIN_SUCCESS'))
          .catch(err => socket.emit('ADD_ERROR', err.message))
      }
    }
    const handleListGames = () => {
      if (socket.handshake.session.userID) {
        socket.join('games')
        broadCastOpenGames()
      }
    }
    const handleLeaveGame = (socket, gameID) => {
      if (socket.handshake.session.userID) {
        socket.leave(`game:${gameID}`)
        socket.emit("LEAVE_SUCCESS")
      }
    }
    const handleCheckUserStatus = () => {
      gameManager.GetClientInfo(socket.handshake.session.userID)
        .then(gameInfo => { socket.join(`game:${gameInfo.id}`) })
        .then(() => socket.emit('USER_STATUS', { game: true }))
        .then(() => broadCastOpenGames())
        .catch(() => socket.emit('USER_STATUS', { game: false }))
    }
    const handleGameClick = (socket, guess) => {
      console.log('Clicking......')
      gameManager.HandleClick(socket.handshake.session.userID, guess.index)
        .then((data) => {
          if (data.completed) broadCastGameOver(data)
          else if (data.resetting) broadcastReset()
          else broadCastGameInfo()
        })
        .catch(err => socket.emit('GAME_ERROR', err.message))
    }

    //game broadCasts
    const broadCastOpenGames = () => {
      let openGames = gameManager.GetOpenGames()
      io.to('games').emit('GAME_LIST', openGames)
    }
    const broadcastReset = () => {
      broadCastGameInfo()
      return gameManager.ResetCards(socket.handshake.session.userID).then(() => broadCastGameInfo())
    }
    const broadCastGameInfo = () => {
      console.log('Request for Game Info')
      gameManager.GetClientInfo(socket.handshake.session.userID)
        .then(gameInfo => io.to(`game:${gameInfo.id}`).emit('GAME_INFO', gameInfo))
        .catch(err => socket.emit('GAME_ERROR', err.message))
    }
    const broadCastGameOver = (game) => {
      console.log('Broadcasting Game Over Info')
      io.to(`game:${game.id}`).emit('GAME_OVER', gameManager.GetGameOverInfo(game.id))
    }

    const handleLogin = (token) => {
      let userID
      if (token) {
        jwt.verify(token, config.secret, async (err, decoded) => {
          if (!err) userID = decoded.user.id
          else console.log(err)
        })
      }
      if (!token || !userID) {
        console.log('Authentication Error')
        socket.emit('AUTH_ERROR', "Token Expired")
      }
      else {
        console.log(`${userID} just connected`)
        socket.handshake.session.userID = userID
        socket.handshake.session.save();
      }
    }
    const handleLogout = () => {
      if (socket.handshake.session.userID) {
        delete socket.handshake.session.userID;
        socket.handshake.session.save();
      }
    }
  })
}

