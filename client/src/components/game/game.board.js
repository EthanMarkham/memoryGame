import React, { useCallback, useEffect } from 'react'
import { Transition } from 'react-spring/renderprops'

function Board(props) {

  const randomDelays = props.board.squares.map(() => Math.random() * 1000 + 200)
  console.log(randomDelays)
  const cantClick = (id) => {
    let i = props.board.squares.findIndex(sq => sq.id === id)
    return (props.board.cardsShowing >= 2 && props.turn !== props.me && props.board.squares[i].value !== "*")
  }
  const Square = (poops) => {
    return (
      <button
        className="square"
        onClick={() => poops.handleClick(poops.id)}
        style={poops.style}
        disabled={cantClick(poops.id)}
      >
        <img
          src={`http://localhost:5000/${poops.image}`}
          alt={poops.civ}
          style={poops.style}
          className="image"
        />
        {poops.showLabels && <label>{poops.civ}</label>}
      </button>
    );
  }



  return <div className="game-board">
    <Transition
      items={props.board.squares} keys={item => item.id}
      initial={{ opacity: 0 }}
      enter={{ opacity: 1 }}
      leave={{ opacity: 0 }}
      update={{ background: '#28b4d7' }}
      trail={50}
      >
      {item => animated => <Square
        value={item.value}
        id={item.id}
        image={item.image}
        style={animated}
        civ={item.civ}
        showLabels={item.labels}
        borderColor={item.matchColor}
        handleClick={props.handleClick}
      />}
    </Transition>
  </div>
}

export default Board;
