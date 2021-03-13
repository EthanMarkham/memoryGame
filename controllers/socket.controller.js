const jwt = require("jsonwebtoken");
const config = require('../config/config.json');

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
    console.log(`${socket.userID} connected`)
    console.log()
    socket.on("listGames", () => {
      socket.join('games')
      broadCastOpenGames(socket)
    })

    socket.on("addGame", (gameInfo) => {
      const addGame = new Promise(async (resolve, reject) => {
        const newGame = await gameManager.NewGame(socket.userID, gameInfo.playerCount)
        if (newGame.error) {
          socket.emit('error', newGame.error.message)
          reject()
        }
        else {
          socket.emit('joinSuccess', true)
          resolve(newGame)
        }
      })
      addGame.then(gameData => {
        console.log(`Added Game. ID: ${gameData.id}. New Count: ${gameManager.GameCount()}`)
        broadCastOpenGames()
      })
    })
    socket.on("joinGameChannel", () => {
      const gameIndex = gameManager.FindGameIndexByUserID(socket.userID)
      const gameInfo = gameManager.GetGameByIndex(gameIndex)

      if (gameIndex == -1) {
        socket.emit('error', { error: { type: 'game', message: 'game not found' } })
        return
      }
      console.log(`${socket.userID} joining channel for Game: ${gameInfo.id} at Index: ${gameIndex}`)

      const joinGameChannel = new Promise((resolve, reject) => { resolve(socket.join(`game ${gameInfo.id}`)) })

      if (gameInfo) {
        joinGameChannel.then(() => { broadCastGameInfo(gameIndex) })
      }
      else {
        socket.emit('error', { error: { type: 'game', message: 'game not found' } })
      }
    })
    socket.on("click", (guess) => {
      const squareIndex = guess.index
      console.log(`${socket.userID} is clicking ${squareIndex}`)
      const clickResponse = gameManager.HandleClick(socket.userID, squareIndex)
      if (clickResponse.error) {
        socket.emit('error', { error: clickResponse.error })
        return
      }

      broadCastGameInfo(clickResponse.gameIndex)

      if (clickResponse.reset) {
        console.log('resetting cards')
        setTimeout(() => {
          gameManager.ResetCards(clickResponse.gameIndex)
          broadCastGameInfo(clickResponse.gameIndex)
        }, 3000)
      }

    })

    socket.on('disconnecting', () => { console.log(socket.rooms) });
  });
  function broadCastGameInfo(gameIndex) {
    const clientInfo = gameManager.ClientInfo(gameIndex)
    if (!clientInfo) return

    console.log(`Broadcasting Game ${clientInfo.id}`)
    io.to(`game ${clientInfo.id}`).emit('gameInfo', clientInfo)
  }
  function broadCastOpenGames() {
    const openGames = gameManager.GetOpenGames()
    console.log(`Broadcasting ${openGames.length} Open Games`)
    io.to('games').emit('games', openGames)
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

