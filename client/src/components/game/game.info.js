import React from 'react';

function GameInfo(props) {
  return (
    <div className="row gameInfo">
      <div className="col-6">
        <div className="gameStats">
          <div className="stat">{props.info.message}</div>
          <div className="stat" > Attempts: {props.info.round}</div>
        </div>
      </div>

      <div className="col-3 text-center">
        <button
          className="gameButton btn"
          onClick={() => { props.setLabels() }}>Toggle Labels</button>
      </div>
      <div className="col-3 text-center">
        <button
          className="gameButton btn"
          onClick={() => {/*startNewGame()*/ }}>FF 11</button>
      </div>
    </div>
  )
}


export default GameInfo;
