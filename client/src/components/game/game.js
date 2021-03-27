import React, { useContext } from 'react';
import { SocketContext } from '../../context/socket';
import { Transition, animated as a } from 'react-spring/renderprops'



const GameInfo = require('./game.info').default

function Game(props) {
  const { gridSize, squares, gameMessage, users, round, setNextState, labels, toggleLables, me, handleQuit } = props
  const socket = useContext(SocketContext);

  const handleClick = id => socket.emit("GAME_CLICK", id)

  const cantClick = (props) => {
    let output = (squares.filter(s => s.flipped).length >= 2 || props.flipped)
    if (users.find(u => u.upNext)) if (users.find(u => u.upNext).username !== me) output = false
    return output
  }

  const Square = (props) => {
    return (
      <a.button key={props.id} className="square" style={{ ...props.style }} onClick={() => handleClick(props.id)} disabled={cantClick(props.id)}>
        <img  key={props.id + 'img'}  src={`http://localhost:5000/${props.image}`} alt={props.civ} />
        {props.showLabels && <label>{props.civ}</label>}
      </a.button>
    );
  }

  return (
    <div className='gameContainer'>
      <div className="game-board" style={{ gridTemplateColumns: `repeat(${gridSize[0]}, minmax(20px, 1fr))`, gridTemplateRows: `repeat(${gridSize[1]}, minmax(20px, 1fr))` }}>
        <Transition
          items={squares} keys={item => item.id}
          initial={{ opacity: 0 }} //height: '0px'
          from={{ opacity: 0, transform: `perspective(600px) rotateX(180deg)`}}
          enter={{ opacity: 1, transform: 'translate3d(0%,0,0) rotateX(0deg)' }} //height: '100%'
          leave={{ opacity: 0, transform: 'translate3d(-50%,0,0) rotateX(180deg)' }}
          //update={{opacity: 1}}
          trail={50}
        >
          {item => animated => <Square showLabels={labels} {...item} style={animated} />}
        </Transition>
      </div>
      <GameInfo
        setNextState={setNextState}
        me={props.me}
        setLabels={toggleLables}
        handleQuit={handleQuit}
        message={gameMessage}
        users={users}
        round={round}
      />
    </div>
  );
}


export default Game;