const jwt = require("jsonwebtoken");
const config = require('../config/config.json');
const User = require("../model/user.model");

exports = module.exports = function (io, gameManager) {
  io.on('connection', (socket) => {
    socket.emit('connected')

    socket.on("GET_STATUS", () => handleCheckUserStatus())
    socket.on("LIST_GAMES", () => handleListGames())

    socket.on("ADD_GAME", gameInfo => handleAddGame(gameInfo))
    socket.on("ADD_ME_TO_GAME", gameID => handleJoinGame(gameID))
    socket.on("LEAVE_GAME", gameID => handleLeaveGame(gameID)) //after game is over
    socket.on("QUIT_GAME", gameID => handleQuitGame(gameID)) //quitting early

    socket.on("GET_GAME", () => broadCastGameInfo())
    socket.on("GAME_CLICK", guess => handleGameClick(guess))

    socket.on("LOGIN", (token) => handleLogin(token))
    socket.on("LOGOUT", () => handleLogout())

    socket.on('disconnecting', () => { console.log(socket.rooms) })

    //HELPER FUNCTIONS TO MAKE ^^^ CLEANER
    const handleJoinGame = (gameID) => {
      console.log('Joining Game')
      User.findById(socket.handshake.session.userID)
      .then(user => gameManager.AddUser(user, gameID))
      .then(_ => handleCheckUserStatus())
      .then(_ => broadCastOpenGames())
      .catch(err => socket.emit('ERROR', err.message))  
    }
    const handleQuitGame = (gameID) => {
      if (socket.handshake.session.userID) {
        User.findById(socket.handshake.session.userID)
        .then(user => gameManager.RemoveUser(user, gameID))
        .then(data => {
          if (!data.deleted) io.to(`game:${data.id}`).emit('GAME_INFO', data.game.ClientInfo())
          handleLeaveGame(data.id)
        })
        .catch(err => socket.emit('ERROR', err.message))
    }
  }
    const handleAddGame = (newGameInfo) => {
      if (socket.handshake.session.userID) {
        User.findById(socket.handshake.session.userID)
          .then(user => gameManager.NewGame(user, newGameInfo.playerCount, newGameInfo.cardCount, newGameInfo.name)) //
          .then(gameInfo => { socket.join(`game:${gameInfo.id}`) })
          .then(() => handleCheckUserStatus()) //client will catch status and apply new game info
          .catch(err => socket.emit('ERROR', err.message))
      }
    }
    const handleListGames = () => {
      if (socket.handshake.session.userID) {
        socket.join('games')
        broadCastOpenGames()
      }
    }
    const handleLeaveGame = (gameID) => {
      if (socket.handshake.session.userID) {
        socket.leave(`game:${gameID}`)
        handleCheckUserStatus()
      }
    }
    const handleCheckUserStatus = () => {
      gameManager.GetClientInfo(socket.handshake.session.userID)
        .then(gameInfo => { socket.join(`game:${gameInfo.id}`) })
        .then(() => {
          socket.leave('games') //in game so no longer in this room
          socket.emit('USER_STATUS', { game: true })
        })
        .then(() => broadCastOpenGames())
        .catch(() => socket.emit('USER_STATUS', { game: false }))
    }
    const handleGameClick = (guess) => {
      console.log('Clicking......')
      gameManager.HandleClick(socket.handshake.session.userID, guess)
        .then((data) => {
          if (data.completed) broadCastGameOver(data)
          else if (data.resetting) broadcastReset()
          else broadCastGameInfo()
        })
        .catch(err => socket.emit('ERROR', err.message))
    }

    //game broadCasts
    const broadCastOpenGames = _ => io.to('games').emit('GAME_LIST', gameManager.GetOpenGames())
    
    const broadcastReset = () => {
      broadCastGameInfo()
      return gameManager.ResetCards(socket.handshake.session.userID).then(() => broadCastGameInfo())
    }
    const broadCastGameInfo = _ => {
      console.log('Request for Game Info')
      gameManager.GetClientInfo(socket.handshake.session.userID)
        .then(gameInfo => io.to(`game:${gameInfo.id}`).emit('GAME_INFO', gameInfo))
        .catch(err => socket.emit('ERROR', err.message))
    }
    const broadCastGameOver = (game) => {
      console.log('Broadcasting Game Over Info')
      io.to(`game:${game.id}`).emit('GAME_INFO', gameManager.GetGameOverInfo(game.id))
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
        handleCheckUserStatus()
      }
    }
    const handleLogout = _ => {
      if (socket.handshake.session.userID) {
        delete socket.handshake.session.userID;
        socket.handshake.session.save();
      }
      socket.emit("LOGOUT_SUCCESS")
    }
  })
}
