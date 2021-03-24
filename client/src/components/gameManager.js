import React, { useState, useEffect, useCallback, useContext } from 'react';
import { SocketContext } from '../context/socket';
import Loader from "react-loader-spinner";

const GameJoiner = require('./game/game.join').default
const Game = require('./game/game').default
const GameCreator = require('./game/game.new').default
const GameOver = require('./game/game.over').default


function GameManager(props) {
  const socket = useContext(SocketContext);

  const [gameState, setGameState] = useState("LOADING")
  const [error, setError] = useState("")
  const [endGameInfo, setEndGameInfo] = useState([])
  const gameStates = { gameState: gameState, setGameState: setGameState, error: error, setError: setError }

  const handleJoinedGame = useCallback(() => {
    setGameState("GAME_FOUND")
  }, [setGameState])
  const handleGameOver = useCallback((gameData) => {
    setEndGameInfo(gameData)
    setGameState("GAME_OVER")
  }, [setGameState])
  const handleGameStatus = useCallback((status) => {
    if (status.game) setGameState("GAME_FOUND")
    else setGameState("GAME_NEW")
  }, [setGameState])

  useEffect(() => {

    socket.emit("GET_STATUS")

    socket.on("USER_STATUS", status => handleGameStatus(status))
    socket.on("JOIN_SUCCESS", () => handleJoinedGame())
    socket.on("GAME_OVER", data => handleGameOver(data))


    return (() => {
      socket.off("USER_STATUS", status => handleGameStatus(status))
      socket.off("JOIN_SUCCESS", () => handleJoinedGame())
      socket.off("GAME_OVER", data => handleGameOver(data))
    })
  }, [])


  return (<>
    {gameState === "LOADING" && <Loader className="loader" type="Rings" color="#00BFFF" height={80} width={80} />}
    {gameState === "GAME_OVER" && <GameOver me={props.authState.auth.user} gameStates={gameStates} gameInfo={endGameInfo} />}
    {gameState === "GAME_FOUND" && <Game me={props.authState.auth.user} gameStates={gameStates} />}
    {gameState === "GAME_JOIN" && <GameJoiner authState={props.authState} gameStates={gameStates} />}
    {gameState === "GAME_NEW" && <GameCreator gameStates={gameStates} />}
  </>)
}

export default GameManager

