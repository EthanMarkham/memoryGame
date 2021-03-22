const io = require("socket.io-client")

export function GetSocket() {
    console.log('initting socket')
    var SocketManager = {
        socket: null,
        connecting: false,
        connected: false,
        Connect: (token, callBack) => {
            let tempToken = (token !== 'undefined' && token) ? token : localStorage.getItem('jwt')
            console.log('connecting with ' + tempToken)
            if (!SocketManager.connected && !SocketManager.connecting) {
                console.log('test')
                SocketManager.connecting = true
                SocketManager.socket = io.connect("ws://localhost:5000/", { reconnectionDelayMax: 10000, auth: { token: JSON.stringify(tempToken) }, withCredentials: true })
                SocketManager.socket.on('connected', () => {
                    SocketManager.connected = true
                    SocketManager.connecting = false
                    if (callBack) callBack()
                })
            }
        },
        Disconnect: (callBack) => {
            if (SocketManager.connected) {
                SocketManager.socket.emit('end')
                SocketManager.socket.on('disconnect', () => {
                    SocketManager.connected = false
                    SocketManager.socket = null
                });
            }
            if (callBack) callBack()
        },
        Renew: (token, callBack) => {
            let tempToken = (token !== 'undefined' && token) ? token : localStorage.getItem('jwt')
            if (SocketManager.connected) SocketManager.Disconnect(() => SocketManager.Connect(tempToken))
            else SocketManager.Connect(token, callBack)
        }
    }

    SocketManager.Connect()

    return SocketManager
}
