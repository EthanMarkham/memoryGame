var React = require('react');

function GameInfo(props) {
  return (
    <div className = "game-info">
      <div className = "col">
        <span className = "message">{props.message}</span>
        <span className = "round" > Attempts: {props.round}</span>
      </div>
      <div className = "col">
        <button 
          className = "restartBtn"
          onClick = {() => {props.setLabels()}}>Toggle Labels</button>
        <button 
          className = "restartBtn"
          onClick = {() => {/*startNewGame()*/}}>Restart</button>
      </div>
    </div>
  );
}

export default GameInfo;
