import io from 'socket.io-client';
import { socket } from '../context/socket';

export default class socketAPI {
    socket;

    connect() {
        this.socket = io.connect(SOCKET_URL, { reconnectionDelayMax: 10000, auth: { token: JSON.stringify(localStorage.getItem('jwt')) }, withCredentials: true });
        return new Promise((resolve, reject) => {
            this.socket.on('connect', () => resolve());
            this.socket.on('connect_error', (error) => reject(error));
        });
    }

    disconnect() {
        return new Promise((resolve) => {
            this.socket.disconnect(() => {
                this.socket = null;
                resolve();
            });
        });
    }

    emit(event, data) {
        return new Promise((resolve, reject) => {
            if (!this.socket) return reject('No socket connection.');

            return this.socket.emit(event, data, (response) => {
                // Response is the optional callback that you can use with socket.io in every request. See 1 above.
                if (response.error) {
                    console.error(response.error);
                    return reject(response.error);
                }

                return resolve();
            });
        });
    }
    on(event, fun) {
        // No promise is needed here, but we're expecting one in the middleware.
        return new Promise((resolve, reject) => {
            if (!this.socket) return reject('No socket connection.');

            this.socket.on(event, fun);
            resolve();
        });
    }
    login() {
        return new Promise((resolve, reject) => {
            socket.emit("LOGIN", JSON.stringify(localStorage.getItem('jwt')))
            socket.on("AUTH_SUCCESS", resolve())
            socket.on("AUTH_ERROR", reject())
        })
    }
    logout() {
        return new Promise((resolve, reject) => {
            socket.emit("LOGOUT")
            socket.on("LOGOUT_SUCCESS", resolve())
        })
    }
    checkStatus() {
        return new Promise((resolve, reject) => {
            socket.emit("GET_STATUS")
            socket.on("USER_STATUS", (status) => (status.game) ? resolve() : reject())
        })
    }
    
}