import React from 'react';

function GameInfo(props) {
  return (
    <div>
      <div className="col">
        <span className="message">{props.info.message}</span>
        <span className="round" > Attempts: {props.info.round}</span>
      </div>
  
      <div className="col">
        <button
          className="restartBtn"
          onClick={() => { props.setLabels() }}>Toggle Labels</button>
        <button
          className="restartBtn"
          onClick={() => {/*startNewGame()*/ }}>FF 11</button>
      </div> 
    </div>
    )
}


export default GameInfo;
