import React, { useEffect, useReducer, useState, useCallback } from "react";
import Loader from "react-loader-spinner";
import { SocketContext, socket } from './context/socket';
import { login } from './helpers'
import socketClient from './modules/socketClient'
const useAuth = require('./hooks/useAuth').default

const Nav = require('./components/nav').default
const Login = require('./components/login').default
const GameJoiner = require('./components/game/game.join').default
const Game = require('./components/game/game').default
const GameCreator = require('./components/game/game.new').default

export default function App() {
  const [auth, setAuth] = useAuth()
  const [error, setError] = useState("")
  const handleError = useCallback((err) => {
    console.log(err)
    setError(err.message)
  }, [setError])
  
  const [pageState, dispatch] = useReducer(reducer(socket), 5)
  const pages = [
    <Loader className="loader" type="Rings" color="#00BFFF" height={80} width={80} />,
    <GameJoiner dispatch={dispatch} setError={handleError} />,
    <GameCreator me={auth.user} dispatch={dispatch} setError={handleError} />,
    <Game me={auth.user} dispatch={dispatch} setError={handleError} />,
    <Login setAuth={setAuth} dispatch={dispatch} setError={handleError} />
  ]
  useEffect(() => {
    login().then(data => {
      if (!data.error) {
        setAuth(true, data)
        socket.emit("GET_STATUS")
      }
      else {
        setAuth(false)
        dispatch({type: "LOGIN_PAGE"})
      }
    })
    socket.on("AUTH_ERROR", () => dispatch({type: "LOGOUT"}))
    socket.on("USER_STATUS", (status) => (status.game) ? dispatch({type: "GAME"}) : dispatch({type: "GAME_JOIN"}))
    socket.on("JOIN_SUCCESS", () => dispatch({type: "GAME"}))
    return () => {
      socket.off("AUTH_ERROR", () => dispatch({type: "LOGOUT"}))
      socket.off("USER_STATUS", (status) => (status.game) ? dispatch({type: "GAME"}) : dispatch({type: "GAME_JOIN"}))
      socket.off("JOIN_SUCCESS", () => dispatch("GAME"))
    }
  }, [])

  return (<SocketContext.Provider value={socket}>
    <Nav auth={auth} dispatch={dispatch} />
    {error && <div className="alert alert-danger"><b>Error!</b> {error}</div>}
    {pages[pageState]}
  </SocketContext.Provider>)
}

