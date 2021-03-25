import React from 'react';

function GameInfo(props) {
  return (
    <div className="gameInfo">
      <div className="userStats">
        <div className="gameStats">
          <div className="stat">{props.info.message}</div>
          <div className="stat" > Attempts: {props.info.round}</div>
        </div>
      </div>


      <div className="currentGame">
        <button
          className="gameButton btn"
          onClick={() => { props.setLabels() }}>Toggle Labels</button>
     
        <button
          className="gameButton btn"
          onClick={() => {/*startNewGame()*/ }}>FF 11</button>
      </div>
    </div>
  )
}


export default GameInfo;
