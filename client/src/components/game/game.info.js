import React from 'react';
import { socket } from "../../configs/socket.config"
import { useHistory } from "react-router-dom";

function GameInfo(props) {
  const history = useHistory();

  function LeaveGame() {
    socket.emit("leaveGame")
    history.push('/join')
  }
  
  return (
    <div className="game-info">
      {props.gameOver === false 
      ? gameStats(props.message, props.round, props.setLabels)
      : gameOver(props.message, props.round, props.setLabels, LeaveGame)
      }
    </div>
  )
}
function gameStats(message, round, setLabels) {
  return (
  <div>
    <div className="col">
      <span className="message">{message}</span>
      <span className="round" > Attempts: {round}</span>
    </div>

    <div className="col">
      <button
        className="restartBtn"
        onClick={() => { setLabels() }}>Toggle Labels</button>
      <button
        className="restartBtn"
        onClick={() => {/*startNewGame()*/ }}>FF 11</button>
    </div> 
  </div>
  )
}
function gameOver(message, round, setLabels, LeaveGame) {
  return (
  <div>
    <div className="col">
      <span className="message">{message}</span>
      <span className="round" > Attempts: {round}</span>
    </div>

    <div className="col">
      <button
        className="restartBtn"
        onClick={() => { setLabels() }}>Toggle Labels</button>
      <button
        className="restartBtn"
        onClick={() => {LeaveGame()}}>Leave</button>
    </div> 
  </div>
  )
}


export default GameInfo;
