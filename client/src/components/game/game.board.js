var React = require('react')
var Square = require('./game.square').default

function Board(props) {
  const cantClick = (i) => {
    return (props.board.cardsShowing >= 2 && props.turn !== props.me && props.board.squares[i].value !== "*")
  }
  function renderSquare(i) {
    //if match color not set set the match color to square match color
    let style = {}

    if (props.board.squares[i].matchColor != null) style['borderColor'] = props.board.squares[i].matchColor
    //pass data to square props
    return (
      <Square
        value={props.board.squares[i].value}
        image={props.board.squares[i].image}
        civ={props.board.squares[i].civ}
        //this doesnt need to be called onclick just comes in handy 
        showLabels={props.labels}
        key={i}
        style={style}
        disableClick={() => cantClick(i)}
        handleClick={() => props.handleClick(i)}
      />
    )
  }
  let board = []

  for (let squareIndex = 0; squareIndex < props.board.squares.length; squareIndex++) {
    board.push(renderSquare(squareIndex))
  }

  return <div className="game-board"> {board} </div>
}

export default Board;
