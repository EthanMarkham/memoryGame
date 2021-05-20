const jwt = require("jsonwebtoken");
const config = require('../config/config.json');
const GameManager = require('../modules/game.manager')

exports = module.exports = function (io) {
  //Relay Game Info from manager
  GameManager.events.on("GAME_LIST", games => io.to(`games`).emit('GAME_LIST', games));

  GameManager.events.on("CLIENT_INFO", gameInfo => io.to(`game:${gameInfo.id}`).emit('GAME_INFO', { game: gameInfo }));
  GameManager.events.on("GAME_OVER", data => io.to(`game:${data.game.id}`).emit('GAME_OVER', data));
  GameManager.events.on("GAME_MESSAGE", data => io.to(`game:${data.id}`).emit('ERROR', data.message)); //switch this so its not error just temp
   
  GameManager.events.on("START_TIMER", data => io.to(`game:${data.id}`).emit('START_TIMER'));
  GameManager.events.on("OUT_OF_TIME", data => io.to(`game:${data.id}`).emit('OUT_OF_TIME', {game: data}));
  GameManager.events.on("CLEAR_TIMER", data => io.to(`game:${data.id}`).emit('CLEAR_TIMER'));

  //io listeners
  io.on('connection', (socket) => {
    socket.emit('connected')

    socket.on("ADD_GAME", gameInfo => handleAddGame(gameInfo))
    socket.on("JOIN_GAME", gameID => handleJoinGame(gameID))
    socket.on("GET_STATUS", _ => handleCheckUserStatus())

    socket.on("JOIN_GAME_LIST", _ => socket.join('games'))
    socket.on("GET_GAME_LIST", _ => socket.emit('GAME_LIST', GameManager.GetOpenGames()))
    socket.on("LEAVE_GAME_LIST", _ => socket.leave('games'))

    socket.on("GET_GAME", _ => handleGetGame());
    socket.on("GAME_CLICK", guess => handleGameClick(guess))
    socket.on("QUIT_GAME", gameID => handleQuitGame(gameID))
    
    socket.on("LEAVE_GAME_ROOM", gameID => {
      socket.leave(`game:${gameID}`);
    })

    socket.on("LOGIN", token => handleLogin(token))
    socket.on("LOGOUT", _ => handleLogout())

    socket.on('disconnecting', () => { console.log(socket.rooms) })

    const handleAddGame = newGameInfo => {
      console.log(socket.handshake.session.userID, newGameInfo)
      GameManager.NewGame(socket.handshake.session.userID, newGameInfo)
        .then(_ => socket.emit('USER_STATUS', { game: true })) //client catches status and asks for games
        .catch(err => { console.log(err); socket.emit('ERROR', err.message) })
    }
    const handleCheckUserStatus = _ => {
      GameManager.GetUserGame(socket.handshake.session.userID)
        .then(_ => socket.emit('USER_STATUS', { game: true }))
        .catch(_ => {
          socket.emit('USER_STATUS', { game: false, openGames: GameManager.GetOpenGames() })
        });
    }
    const handleGetGame = _ => {
      GameManager.GetUserGame(socket.handshake.session.userID)
        .then(gameInfo => {
          console.log('sending game info');
          socket.join(`game:${gameInfo.id}`);
          socket.emit('GAME_INFO', { game: gameInfo});
        })
        .catch(_ => {
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
        .then(_ => socket.emit('USER_STATUS', { game: true }))
        .catch(err => { console.log(err); socket.emit('ERROR', err.message) })
    }
    const handleQuitGame = _ => {
      GameManager.RemoveUser(socket.handshake.session.userID)
        .then(_ => {
          socket.emit('USER_STATUS', { game: false});
        })
        .catch(err => { console.log(err); socket.emit('ERROR', err.message) })
    }
    const handleLogin = token => {
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
    const handleLogout = _ => {
      if (socket.handshake.session.userID) {
        delete socket.handshake.session.userID;
        socket.handshake.session.save();
      }
      socket.emit("LOGOUT_SUCCESS")
    }
  })
}