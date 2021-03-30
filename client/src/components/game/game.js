import React, {useEffect, useReducer} from 'react';
import { useTransition, animated as a } from 'react-spring'
import { getGridLayout } from '../../helpers'

const useWindowSize = require('../../hooks/useWindowSize').default

const GameInfo = require('./game.info').default

function Game(props) {
  const { game, springs, me, handleClick, handleQuit, dispatch } = props
  const { users, message, round, squares } = game
  const size = useWindowSize()

  const [gridSize, dispatchGridSize] = useReducer(() => {
    return getGridLayout(squares.length, size)
  }, [size, squares.length])

  useEffect(() => {
    dispatchGridSize()
  }, [size, squares.length])


  const getTurn = () => ((users.length > 0) ? users.find(u => u.upNext).username : "Waiting")

  const cantClick = (id) => {
    let i = squares.findIndex(sq => sq.id == id);
    let turn = getTurn()
    if (squares.filter(s => s.flipped).length >= 2 || squares[i].image !== "/cards/back.PNG") return true
    else if (turn !== me) return true
    else return false
  }
  return (
    <div className='gameContainer'>
      <div className="game-board" style={{ gridTemplateColumns: `repeat(${gridSize[0]}, minmax(20px, 1fr))`, gridTemplateRows: `repeat(${gridSize[1]}, minmax(20px, 1fr))` }}>
        {springs.map(({ item, props, key }) => (
          <a.div
            style={{ ...props }}
            key={key}
            className="squareHolder">
            <button
              className="square"
              onClick={() => handleClick(item.id)}
              style={{ backgroundImage: `url(http://localhost:5000/${item.image})` }}//;fix show labels
              disabled={cantClick(item.id)}>
              {game.showLabels && <label>{item.civ}</label>}
            </button>
          </a.div>
        )
        )}
      </div>
      <GameInfo
        me={me}
        users={users}
        round={round}
        message={message}
        turn={() => (getTurn())}
        handleQuit={handleQuit}
        dispatch={dispatch}
      />
    </div>
  )
}


export default Game;