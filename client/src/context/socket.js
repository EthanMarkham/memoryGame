import socketio from "socket.io-client";
import { SOCKET_URL } from "../config.json";
import React from 'react';
export const socket = socketio.connect(SOCKET_URL, { reconnectionDelayMax: 10000});
export const SocketContext = React.createContext();