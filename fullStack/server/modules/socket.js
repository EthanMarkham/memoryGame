require('dotenv').config(); // Allows use of environmental variables from the .env file
const jwt = require("jsonwebtoken");
const GameManager = require('./game.manager')

exports = module.exports = function (io) {

  GameManager.events.on("CLIENT_INFO", gameInfo => {
    console.log('sending info', gameInfo.id)
    io.to(`game:${gameInfo.id}`).emit('GAME_INFO', { game: gameInfo })
  });
  GameManager.events.on("GAME_LIST", games => {
    io.to(`games`).emit('GAME_LIST', games)
  });
  GameManager.events.on("GAME_MESSAGE", data => {
    io.to(`game:${data.id}`).emit('ERROR', data.message) //switch this so its not error just temp
  }); 
  GameManager.events.on("GAME_TIMER", data => {
    io.to(`game:${data.id}`).emit('GAME_TIMER', data.timeLeft) 
  });
  io.on('connection', (socket) => {
    socket.emit('connected')

    socket.on("ADD_GAME", gameInfo => handleAddGame(gameInfo))
    socket.on("JOIN_GAME", gameID => handleJoinGame(gameID))
    socket.on("GET_STATUS", _ => handleCheckUserStatus())

    socket.on("JOIN_GAME_LIST", _ => joinGameList())

    socket.on("GAME_CLICK", guess => handleGameClick(guess))
    socket.on("QUIT_GAME", gameID => handleQuitGame(gameID))

    socket.on("LEAVE_GAME_LIST", _ => socket.leave('games'))
    socket.on("LOGIN", token => handleLogin(token))
    socket.on("LOGOUT", _ => handleLogout())

    socket.on('disconnecting', () => { console.log(socket.rooms) })

    const handleAddGame = newGameInfo => {
      console.log(socket.handshake.session.userID, newGameInfo)
      GameManager.NewGame(socket.handshake.session.userID, newGameInfo)
        .then(newGame => {
          socket.join(`game:${newGame.id}`)
          socket.emit('USER_STATUS', { game: newGame.ClientInfo() }) //client catches status and asks for games
        }).catch(err => { console.log(err); socket.emit('ERROR', err.message) })
    }
    const handleCheckUserStatus = _ => {
      GameManager.CheckUserStatus(socket.handshake.session.userID)
        .then(gameInfo => {
          socket.join(`game:${gameInfo.id}`)
          socket.emit('USER_STATUS', { game: gameInfo })
        })
        .catch(_ => {
          socket.join('games')
          socket.emit('USER_STATUS', { game: false, openGames: GameManager.GetOpenGames() })
        })
    }
    const handleGameClick = guess => {
      console.log('Clicking......')
      GameManager.HandleClick(socket.handshake.session.userID, guess)
      .catch(err => { console.log(err); socket.emit('ERROR', err.message) })
    }
    const handleJoinGame = gameID => {
      console.log('Joining Game')
      GameManager.AddUser(socket.handshake.session.userID, gameID)
        .then(gameInfo => {
          socket.join(`game:${gameInfo.id}`)
          socket.leave('games') //in game so no longer in this room
          socket.emit('USER_STATUS', { game: gameInfo })
        })
        .catch(err => { console.log(err); socket.emit('ERROR', err.message) })
    }
    const handleQuitGame = gameID => {
      GameManager.RemoveUser(socket.handshake.session.userID)
        .then(_ => {
          socket.leave(`game:${gameID}`);
          socket.emit('USER_STATUS', { game: false, openGames: GameManager.GetOpenGames() });
        })
        .catch(err => { console.log(err); socket.emit('ERROR', err.message) })
    }
    const joinGameList = _ => {
      socket.join('games')
      socket.emit('GAME_LIST', GameManager.GetOpenGames())
    }
    const handleLogin = token => {
      let userID
      if (token) {
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
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
    const handleLogout = _ => {
      if (socket.handshake.session.userID) {
        delete socket.handshake.session.userID;
        socket.handshake.session.save();
      }
      socket.emit("LOGOUT_SUCCESS")
    }
  })
}