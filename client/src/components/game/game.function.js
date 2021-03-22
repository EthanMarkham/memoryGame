import React, { useState, useEffect, useCallback, useContext } from 'react';
import {SocketContext} from '../../context/socket';
import { Alert, Button } from "react-bootstrap"
import '../../styles/game.css';

var Board = require('./game.board').default
var GameInfo = require('./game.info').default

const initialBoardState = {
  squares: [],
  cardsShowing: 0,
  turn: ''
}
const initialInfoState = {
  message: "",
  users: [],
  round: 0,
}

function Game(props) {
  var isMounted = false
  const socket = useContext(SocketContext);

  const [board, setBoard] = useState(initialBoardState)
  const [info, setInfo] = useState(initialInfoState)

  const [labels, setLabels] = useState(true)
  const [error, setError] = useState("")

  const handleBoardInfo = useCallback((data) => {
    setInfo({
      message: data.message,
      error: "",
      users: data.users,
      round: data.round,
    })
    setBoard({
      squares: data.squares,
      cardsShowing: data.cardsShowing,
      turn: data.users.find(u => u.upNext).username
    })
  }, [])
  
  const handleError = useCallback((err) => {
    console.log(err)
    setError(err)
  })
  const handleClick = (i) => { console.log(1); socket.emit("GAME_CLICK", { index: i })}
  const toggleLables = useCallback(() => {setLabels(!labels)})
  
  useEffect(() => {
    if (!isMounted) {
      isMounted = true
      socket.emit("GET_GAME")

      socket.on("GAME_INFO", data => handleBoardInfo(data))
      socket.on("GAME_ERROR", data=> handleError(data))
    }
    return () => {
      socket.off("GAME_INFO", data => handleBoardInfo(data))
      socket.off("GAME_ERROR", data => handleError(data))
      isMounted = false
    }
  }, []);
 
  useEffect(() => {
    console.log(board)
    console.log(info)
  }, [board, info])
  return (
    <div className="game">
      <Board
        me={props.me}
        board={board}
        labels={labels}
        handleClick={handleClick}
      />
      <GameInfo
        me={props.me}
        info={info}
        setLabels={toggleLables}
        turn={board.turn}
      />
    </div>
  );
}

export default Game;