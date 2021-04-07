exports = module.exports = function (io) {
  const SocketController = require('../controllers/socket.controller')
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
}