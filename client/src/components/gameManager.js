import React, { useState, useEffect, useCallback, useContext } from 'react';
import {SocketContext} from '../context/socket';

const GameJoiner = React.lazy(() => import('./game/game.join'))
const Game = React.lazy(() => import('./game/game.'))
const GameCreator = React.lazy(() => import('./game/game.new'))
const GameOver = React.lazy(() => import('./game/game.over'))


function GameManager(props) {
  var isMounted = false
  const socket = useContext(SocketContext);

  const [gameState, setGameState] = useState("LOADING")
  const [error, setError] = useState("")
  const [endGameInfo, setEndGameInfo] = useState([])
  const gameStates = { gameState: gameState, setGameState: setGameState, error: error, setError: setError }

  const handleJoinedGame = useCallback(() => { 
    setGameState("GAME_FOUND") 
  }, [])
  const handleGameOver = useCallback((gameData) => {
    setEndGameInfo(gameData)
    setGameState("GAME_OVER")
  }, [])
  const handleGameStatus = useCallback((status) => {
    if (status.game) setGameState("GAME_FOUND")
    else setGameState("GAME_NEW")
  })
   
  useEffect(() => {
    if (!isMounted) {
      isMounted = true
      socket.emit("GET_STATUS")

      socket.on("USER_STATUS", status => handleGameStatus(status))
      socket.on("JOIN_SUCCESS", () => handleJoinedGame())
      socket.on("GAME_OVER", data => handleGameOver(data))
    }

    return (() => {
      socket.off("USER_STATUS", status => handleGameStatus(status))
      socket.off("JOIN_SUCCESS", () => handleJoinedGame())
      socket.off("GAME_OVER", data => handleGameOver(data))
      isMounted = false
    })
  }, [])

  let child = <>???</>
  if (gameState === "LOADING") child = <Loading />
  else if (gameState === "GAME_OVER") child = <GameOver me={props.authState.auth.user} gameStates={gameStates} gameInfo={endGameInfo} />
  else if (gameState === "GAME_FOUND") child = <Game me={props.authState.auth.user} gameStates={gameStates} />
  else if (gameState === "GAME_JOIN") child = <GameJoiner authState={props.authState} gameStates={gameStates} />
  else if (gameState === "GAME_NEW") child = <GameCreator gameStates={gameStates} />

  return (<>{child}</>)
}

export default GameManager

function Loading(props) {
  return (<div className="loading">Loading</div>)
}
