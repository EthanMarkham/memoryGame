import React, { useEffect, useState, useCallback, useReducer } from "react";
import Loader from "react-loader-spinner";
import { SocketContext, socket } from './context/socket';
import { login, getGridLayout } from './helpers'
import { useTransition, animated } from 'react-spring'

const useAuth = require('./hooks/useAuth').default
const useWindowSize = require('./hooks/useWindowSize').default
const useDidMountEffect = require('./hooks/didMount').default

const Login = require('./components/login').default
const Nav = require('./components/nav').default

const GameJoiner = require('./components/game/game.join').default
const Game = require('./components/game/game').default
const GameCreator = require('./components/game/game.new').default
const GameOver = require('./components/game/game.over').default


export default function App() {
  const [auth, setAuth] = useAuth()
  const [state, setState] = useState("LOADING")
  const windowSize = useWindowSize()
  const [gameID, setGameID] = useState('0')
  const [squares, setSquares] = useState([])
  const [round, setRound] = useState(0);
  const [gameMessage, setGameMessage] = useState("Loading")
  const [users, setUsers] = useState([])
  const [labels, setLabels] = useState(true)
  const [error, setError] = useState("")
  const [endGameInfo, setEndGameInfo] = useState([])
  const [joinableGames, setJoinableGames] = useState([])

  const [gridSize, dispatchGridSize] = useReducer(() => {
    return getGridLayout(squares.length, windowSize)
  }, [squares.length, windowSize])

  const handleAuthState = useCallback(loginData => {
    if (loginData) {
      if (!loginData.error) {
        setAuth(true, loginData)
      }
    }
    else setAuth(false)
  }, [setAuth])

  const handleGameState = useCallback((nextS, gameData) => {
    if (nextS === undefined) return
    if (nextS === "GAME_OVER") {
      setEndGameInfo(gameData)
      setState("GAME_OVER")
      return
    }
    if (nextS === "GAME_FOUND") socket.emit("GET_GAME")

    setState(nextS)
  }, [setState])

  const handleGameList = useCallback(data => setJoinableGames(data), [setJoinableGames])
  const handleSquareInfo = useCallback(squares => setSquares(squares), [setSquares])
  const handleGameMessage = useCallback(msg => setGameMessage(msg), [setGameMessage])
  const handleUserInfo = useCallback(users => setUsers(users), [setUsers])
  const handleRoundInfo = useCallback(round => setRound(round), [setRound])
  const handleGameID = useCallback(id => setGameID(id), [setGameID])

  const handleQuit = () => { setState("GAME_JOIN"); socket.emit("QUIT_GAME", gameID) }
  const toggleLables = () => { setLabels(!labels) }

  useEffect(() => {
    login().then(data => handleAuthState(data))
    socket.on("AUTH_ERROR", () => handleAuthState(false))
    socket.on("USER_STATUS", status => (status.game) ? handleGameState("GAME_FOUND") : handleGameState("GAME_NEW"))

    socket.on("GAME_INFO", data => {
      console.log(data)
      handleSquareInfo(data.squares)
      handleGameMessage(data.message)
      handleGameID(data.id)
      handleUserInfo(data.users)
      handleRoundInfo(data.round)
    })
    socket.on("GAME_LIST", data => handleGameList(data))
    socket.on("JOIN_SUCCESS", () => handleGameState("GAME_FOUND"))
    socket.on("GAME_OVER", data => handleGameState("GAME_OVER", data))
    socket.on("LEAVE_SUCCESS", () => handleGameState()) //looking for next state set from child
    return () => {
      socket.off()
    }
  }, [])

  useEffect(() => {
    dispatchGridSize()
  }, [windowSize, squares.length])

  useDidMountEffect(() => {
    console.log(auth);
    if (auth.isAuth) {
      socket.emit('LOGIN', localStorage.getItem('jwt'))
      socket.emit("GET_STATUS")
    }
    else {
      setState("LOGIN")
    }
  }, [auth])

  const pages = {
    "LOADING": <Loader className="loader" type="Rings" color="#00BFFF" height={80} width={80} />,
    "GAME_OVER": <GameOver me={auth.user} handleGameState={handleGameState} gameInfo={endGameInfo} />,
    "GAME_FOUND": <Game me={auth.user} gridSize={gridSize} gameID={gameID} squares={squares} gameMessage={gameMessage} users={users} round={round} labels={labels} handleQuit={handleQuit} toggleLables={toggleLables} />,
    "GAME_JOIN": <GameJoiner setState={setState} games={joinableGames} />,
    "GAME_NEW": <GameCreator setState={setState} />,
    "LOGIN": <Login setAuth={setAuth} error={error} setError={setError} />
  }
  return (<SocketContext.Provider value={socket}>
    <Nav setAuth={setAuth} auth={auth} />
    {pages[state]}
  </SocketContext.Provider >)
}

