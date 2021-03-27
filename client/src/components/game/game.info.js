import React from 'react';

function GameInfo(props) {
  return (
    <div className="gameInfo">
      <div className="userStats">
        <div className="gameStats">
          <div className="stat">{props.message}</div>
          <div className="stat" > Attempts: {props.round}</div>
        </div>
      </div>


      <div className="currentGame">
        <button
          className="gameButton btn"
          onClick={() => { props.setLabels() }}>Toggle Labels</button>
     
        <button
          className="gameButton btn"
          onClick={() => { if (window.confirm('Are you sure you wish to leave this game?')) props.handleQuit() } }>FF 11</button>
      </div>
    </div>
  )
}


export default GameInfo;
