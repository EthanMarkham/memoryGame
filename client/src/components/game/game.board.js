import React, { useEffect, useReducer } from 'react'
import { Transition } from 'react-spring/renderprops'
const useWindowSize = require('../../hooks/useWindowSize').default

function Board(props) {
  const size = useWindowSize()
  const [gridSize, dispatchGridSize] = useReducer(() => {
    return getGridLayout(props.board.squares.length, size)
  }, size)
  //const randomDelays = props.board.squares.map(() => Math.random() * 1000 + 200)
  const cantClick = (id) => {
    let i = props.board.squares.findIndex(sq => sq.id === id)
    return (props.board.cardsShowing >= 2 && props.turn !== props.me && props.board.squares[i].value !== "*")
  }
  useEffect(() => {
    dispatchGridSize()
  }, [size, props.board.squares.length])


  const Square = (poops) => {
    return (
      <button
        className="square"
        onClick={() => poops.handleClick(poops.id)}
        style={{ ...poops.style }}//;
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



  return <div className="game-board" style={{gridTemplateColumns: `repeat(${gridSize[0]}, minmax(20px, 1fr))`, gridTemplateRows: `repeat(${gridSize[1]}, minmax(20px, 1fr))`}}>
    <Transition
      items={props.board.squares} keys={item => item.id}
      initial={{ opacity: 0, background: '#6400e3' }} //height: '0px'
      enter={{ opacity: 1, background: '#E3F2FD' }} //height: '100%'
      leave={{ opacity: 0 }}
      update={{ background: '#6400e3' }}
      trail={25}
    >
      {item => animated =><Square
        value={item.value}
        id={item.id}
        image={item.image}
        style={animated}
        civ={item.civ}
        showLabels={props.labels}
        borderColor={item.matchColor}
        handleClick={props.handleClick}
      />}
    </Transition>
  </div>
}

export default Board;

function getGridLayout(itemCount, windowSize) {
  if (windowSize.height === 0 || windowSize.width === 0) return
  let windowDivedend = (windowSize.width / windowSize.height)
  let factorDividends = getFactors(itemCount).map(f => ({
    factor: f,
    dividend: (f[0] / f[1])
  }))
  let output = { dividend: itemCount, factor: [itemCount, 1] } //need to better use reducer 
  for (let i = 0; i < factorDividends.length; i++) {
    if (Math.abs(output.dividend - windowDivedend) > Math.abs(factorDividends[i].dividend - windowDivedend)) output = factorDividends[i]
  }
  return output.factor
}

function getFactors(num) {
  if (typeof num !== "number") return
  let factors = []
  for (let i = 0; i <= num; i++) {
    if (num % i === 0) {
      factors.push([i, num / i])
    }
  }
  return factors
}