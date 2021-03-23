const io = require("socket.io-client")

export function GetSocket() {
    console.log('initting socket')
    var SocketManager = {
        socket: null,
        connecting: false,
        connected: false,
        Connect: () => {
            return new Promise((resolve, reject) => {
                if (SocketManager.connected) reject('Already connected')
                if (!SocketManager.connecting) reject('Currently Connecting')
                console.log('connecting')
                SocketManager.connecting = true
                SocketManager.socket = io.connect("ws://localhost:5000/", { reconnectionDelayMax: 10000, auth: { token: JSON.stringify(localStorage.getItem('jwt')) }, withCredentials: true })

                SocketManager.socket.on('connected', () => {
                    SocketManager.connected = true
                    SocketManager.connecting = false
                    resolve()
                })
            })
        },
        Disconnect: () => {
            return new Promise((resolve) => {
                if (SocketManager.connected) {
                    SocketManager.socket.emit('disconnecting')
                    SocketManager.connected = false
                    SocketManager.socket.off()
                    resolve()
                }
            })

        },
        Renew: () => {
            SocketManager.Disconnect()
                .then(() => SocketManager.Connect())
        }
    }

    SocketManager.Connect()

    return SocketManager
}
