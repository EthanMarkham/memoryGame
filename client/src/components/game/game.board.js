var React = require('react')
var Square = require('./game.square').default
var socket = require("../../service/socket").socket

function Board(props){
  const handleClick = (i) => {socket.emit("click", {index: i})}

  function renderSquare(i){
    //if match color not set set the match color to square match color
    let style = {}

    if (props.squares[i].matchColor != null) style['borderColor'] = props.squares[i].matchColor
    //pass data to square props
    return (
    <Square 
      value={props.squares[i].value}
      image={props.squares[i].image}
      civ={props.squares[i].civ}
      //this doesnt need to be called onclick just comes in handy 
      showLabels={props.showLabels}
      key={i}
      style={style}
      disableClick={props.disableClick}
      handleClick={() => handleClick(i)}
    />
    )
  }
  let board = []

  for (let squareIndex = 0; squareIndex < props.squares.length; squareIndex++) {
    board.push(renderSquare(squareIndex))
  }
    
  return <div className="game-board"> {board} </div>
}

export default Board;
