import React, { useEffect, useReducer } from "react";
import { useTransition } from 'react-spring'
import Loader from "react-loader-spinner";
import { checkAuth, getGridLayout } from './helpers'

const socket = require("./context/socket").socket;
const reducer = require('./reducers/root').default

const Nav = require('./components/nav').default
const Login = require('./components/login').default
const GameJoiner = require('./components/game/game.join').default
const Game = require('./components/game/game').default
const GameCreator = require('./components/game/game.new').default
const GameOver = require('./components/game/game.over').default

const initialState = {
  auth: { username: 'Guest', token: localStorage.getItem('jwt'), isAuth: false },
  pageIndex: 0, //index 0: Loader, 1: Join, 2: New, 3: Game, 4: Login
  game: {
    id: null,
    status: "WAITING",
    squares: [],
    round: 0,
    message: '',
    users: [],
    showLabels: true,
    listening: false
  },
  gameList: { games: [], listening: false },
  error: ''
}
export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  useEffect(() => {
    checkAuth().then(data => dispatch({ type: "LOGIN", payload: data })) //init check auth, dispatch response which is handled in reducer
    socket.on("ERROR", data => dispatch({ type: "ERROR", payload: data }))
  }, [])

  useEffect(() => {
    if (state.auth.isAuth) {
      socket.emit("LOGIN", localStorage.getItem('jwt')) //init socket session
      socket.on("USER_STATUS", status => dispatch({ type: "STATUS", payload: status })) //backend can control where user is by emmitting user status
    }
    else {
      socket.emit("LOGOUT") //tell socket to clear session, mb clean this up with logging out state?
      socket.off("USER_STATUS")
    }
  }, [state.auth])

  useEffect(() => {
    if (state.game.listening) {
      socket.emit("GET_GAME") //initial ask for game from server
      socket.on("GAME_INFO", data => dispatch({ type: "GAME_INFO", payload: data })) 
    }
    else socket.off("GAME_INFO")
  }, [state.game.listening])

  useEffect(() => {
    if (state.gameList.listening) socket.on("GAME_LIST", data => dispatch({ type: "GAME_LIST", payload: data }))
    else socket.off("GAME_LIST")
  }, [state.gameList.listening])



  const springs = useTransition(state.game.squares, item => item.id, {
    //from: { opacity: 0},
    to: { opacity: 1 },
    from: { opacity: 0 },
    enter: { transform: `perspective(600px) rotateX(0deg)`, opacity: 1 },
    initial: { transform: `perspective(600px) rotateX(0deg)`, opacity: 0 },
    update: { transform: `perspective(600px) rotateX(0px)`, opacity: 1 },
    //unique: true,
    trail: 50
  })
  const handleClick = id => socket.emit("GAME_CLICK", id)
  const handleQuit = () => { socket.emit("QUIT_GAME", this.game.gameID); dispatch({ type: "QUIT_GAME" }); }
  const addGame = (data) => { socket.emit("ADD_GAME", data) }
  const joinGame = id => socket.emit("ADD_ME_TO_GAME", id)

  const pages = [
    <Loader className="loader" type="Rings" color="#00BFFF" height={80} width={80} />,
    <GameJoiner dispatch={dispatch} games={state.gameList.games} joinGame={joinGame} />,
    <GameCreator dispatch={dispatch} addGame={addGame} />,
    <Game game={state.game} springs={springs} me={state.auth.username} handleClick={handleClick} handleQuit={handleQuit} dispatch={dispatch} />,
    <Login dispatch={dispatch} />,
    <GameOver game={state.game} me={state.auth.username} dispatch={dispatch} />
  ]
  return (<>
    <Nav auth={state.auth} dispatch={dispatch} />
    {state.error && <div className="alert alert-danger"><b>Error!</b> {state.error}</div>}
    {pages[state.pageIndex]}
  </>)
}

