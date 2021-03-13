const io = require("socket.io-client")
const tempToken = localStorage.getItem('jwtToken')
export const socket = io(
    "ws://localhost:5000/", 
    {
        reconnectionDelayMax: 10000, 
        auth: {token: tempToken}, 
        withCredentials: true 
    }
)

