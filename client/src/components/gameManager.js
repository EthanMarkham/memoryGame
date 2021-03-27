import React, { useState, useEffect, useCallback, useContext, useReducer } from 'react';
import { SocketContext } from '../context/socket';
import Loader from "react-loader-spinner";

const GameJoiner = require('./game/game.join').default
const Game = require('./game/game').default
const GameCreator = require('./game/game.new').default
const GameOver = require('./game/game.over').default


function GameManager(props) {
  const socket = useContext(SocketContext);
  //const [error, setError] = useState("")
  const [gameState, setGameState] = useState("LOADING")
  const [endGameInfo, setEndGameInfo] = useState([])

  const changeGameState = useCallback((nextState, gameDate) => {
    if (!nextState) nextState = "LOADING"
    switch (nextState) {
      case "GAME_OVER":
        setEndGameInfo(gameDate) //fall through 
      default: setGameState(nextState)
    }
  }, [setEndGameInfo, setGameState])

  useEffect(() => {
    socket.emit("GET_STATUS")
    socket.on("USER_STATUS", status => (status.game) ? changeGameState("GAME_FOUND") : changeGameState("GAME_NEW"))
    socket.on("JOIN_SUCCESS", () => changeGameState("GAME_FOUND"))
    socket.on("GAME_OVER", data => changeGameState("GAME_OVER", data))
    return (() => {
      socket.off("USER_STATUS", status => (status.game) ? changeGameState("GAME_FOUND") : changeGameState("GAME_NEW"))
      socket.off("JOIN_SUCCESS", () => changeGameState("GAME_FOUND"))
      socket.off("GAME_OVER", data => changeGameState("GAME_OVER", data))
    })
  }, [])

  return (<>
    {gameState === "LOADING" && <Loader className="loader" type="Rings" color="#00BFFF" height={80} width={80} />}
    {gameState === "GAME_OVER" && <GameOver me={props.authState.auth.user} setGameState={changeGameState} gameInfo={endGameInfo} />}
    {gameState === "GAME_FOUND" && <Game me={props.authState.auth.user} setGameState={changeGameState} />}
    {gameState === "GAME_JOIN" && <GameJoiner authState={props.authState} setGameState={changeGameState} />}
    {gameState === "GAME_NEW" && <GameCreator setGameState={changeGameState} />}
  </>)
}

export default GameManager

