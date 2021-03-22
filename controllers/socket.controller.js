const jwt = require("jsonwebtoken");
const config = require('../config/config.json');
const User = require("../model/user.model");

exports = module.exports = function (io, gameManager) {
  //set up auth middleware
  io.use((socket, next) => {
    let token = JSON.parse(socket.handshake.auth.token)
    let userID = null
    if (token) {
      jwt.verify(token, config.secret, async (err, decoded) => {
        if (!err) userID = decoded.user.id
        else console.log(err)
      })
    }
    console.log(`${userID} just connected`)
    if (!token || !userID) {
      console.log('err')
      socket.emit('AUTH_ERROR', "Token Expired")
      next()
      //socket.disconnect(0)
    }
    else socket.userID = userID
    next()
  })

  io.on('connection', (socket) => {

    socket.on("LIST_GAMES", () => handleListGames(socket, io))
    socket.on("ADD_GAME", gameInfo => handleAddGame(socket, gameInfo))
    socket.on("GET_STATUS", () => handleCheckUserStatus(socket))
    socket.on("JOIN_GAME", () => handleJoinChannel(socket))
    socket.on("GET_GAME", () => broadCastGameInfo(socket))
    socket.on("LEAVE_GAME", () => handleLeaveGame(socket))
    socket.on("GAME_CLICK", (guess) => handleGameClick(socket, guess))

    socket.on('disconnecting', () => { console.log(socket.rooms) })
  })

  //HELPER FUNCTIONS TO MAKE ^^^ CLEANER
  const handleJoinChannel = (socket) => {
    console.log('Join Request')
    gameManager.GetClientInfo(socket.userID)
      .then(gameInfo => { socket.join(`game:${gameInfo.id}`) })
      .then(() => socket.emit('JOIN_SUCCESS'))
      .then(() => broadCastOpenGames())
      .catch(err => socket.emit('JOIN_ERROR', err.message))
  }
  const handleAddGame = (socket, newGameInfo) => {
    User.findById(socket.userID)
      .then(user => gameManager.NewGame(user, newGameInfo.playerCount))
      .then(gameInfo => { socket.join(`game:${gameInfo.id}`) })
      .then(() => socket.emit('JOIN_SUCCESS'))
      .catch(err => socket.emit('ADD_ERROR', err.message))
  }
  const handleListGames = (socket) => {
    socket.join('games')
    broadCastOpenGames()
  }
  const handleLeaveGame = (socket) => {
    socket.leave(`game:${game.id}`)
    socket.emit("LEAVE_SUCCESS")
  }
  const handleCheckUserStatus = (socket) => {
    gameManager.GetClientInfo(socket.userID)
    .then(gameInfo => { socket.join(`game:${gameInfo.id}`) })
    .then(() => socket.emit('USER_STATUS', {game: true}))
    .then(() => broadCastOpenGames())
    .catch(() => socket.emit('USER_STATUS', {game: false}))
  }
  const handleGameClick = (socket, guess) => {
    console.log('Clicking......')
    gameManager.HandleClick(socket.userID, guess.index)
      .then((data) => {
        if (data.completed) broadCastGameOver(data)
        else if (data.resetting) broadcastReset(socket)
        else broadCastGameInfo(socket)
      })
      .catch(err => socket.emit('GAME_ERROR', err.message))
  }

  //game broadCasts
  const broadCastOpenGames = () => {
    let openGames = gameManager.GetOpenGames()
    io.to('games').emit('GAME_LIST', openGames)
  }
  const broadcastReset = (socket) => {
    broadCastGameInfo(socket)
    return gameManager.ResetCards(socket.userID).then(() => broadCastGameInfo(socket))
  }
  const broadCastGameInfo = (socket) => {
    console.log('Request for Game Info')
    gameManager.GetClientInfo(socket.userID)
      .then(gameInfo => io.to(`game:${gameInfo.id}`).emit('GAME_INFO', gameInfo))
      .catch(err => socket.emit('GAME_ERROR', err.message))
  }
  const broadCastGameOver = (game) => {
    console.log('Broadcasting Game Over Info')
    io.to(`game:${game.id}`).emit('GAME_OVER', gameManager.GetGameOverInfo(game.id))
  }
}

