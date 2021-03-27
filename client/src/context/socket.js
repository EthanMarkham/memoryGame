import React from 'react'
import socketio from "socket.io-client";
import { SOCKET_URL } from "../config.json";

export const socket = socketio.connect(SOCKET_URL, { reconnectionDelayMax: 10000, withCredentials: true });
export const SocketContext = React.createContext();