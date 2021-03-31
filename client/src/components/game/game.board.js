
import { animated as a } from 'react-spring'

function Board(props) {
  const { game, springs, me, handleClick, gridSize, turn} = props
  const { squares } = game

  const cantClick = (id) => {
    let i = squares.findIndex(sq => sq.id == id);
    if (squares.filter(s => s.flipped).length >= 2 || squares[i].image !== "/cards/back.PNG") return true
    else if (turn !== me) return true
    else return false
  }
  return (
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
  )
}


export default Board;