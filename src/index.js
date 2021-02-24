import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button 
      className="square" 
      onClick={props.onClick}
    >
    {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
    <Square 
      value={this.props.values[i]}
      //this doesnt need to be called onclick just comes in handy 
      onClick= {()=> this.props.onClick(i)}
    />
    )
  }

  createBoard = (size) => {
    let board = [],
        root = Math.sqrt(size) | 0,
        squareIndex = 0

    for (let row = 0; row < root; row++) {
      let children = [],
          nextIndex = squareIndex + root
      for (squareIndex; squareIndex < nextIndex; squareIndex++) {
          children.push(this.renderSquare(squareIndex))
      }
      board.push(<div className="board-row">{children}</div>)
    }
    return board
  }

  render() { return ( <div>{this.createBoard(this.props.values.length)}</div> ) }
}

class Game extends React.Component {
  constructor(props){
    let boardValues = generateBoard(4)
    super(props)
    this.state = {
      values: Array(boardValues.length).fill("*"),
      defaultValues: Array(boardValues.length).fill("*"),
      cardsShown: 0,
      lastGuess: -1,
      round: 0,
      boardValues: boardValues,
      message: "Guess a square"
    }
  }

  handleClick(i){
    let values = this.state.values,
        defaultValues = this.state.defaultValues,
        cardsShown = this.state.cardsShown,
        lastGuess = this.state.lastGuess,
        round = this.state.round,
        message = "Guess a square"

   //if square or winner set do nothing
    if (this.state.waiting) return
    //if square is already set do nothing
    if (values[i] !== "*" || "*" !== defaultValues[i]) return
    

    if (arrayEquals(defaultValues, this.state.boardValues)) {
      console.log("t")
      return
    }

    //if two cards match check for winner and flip over
    if (cardsShown === 2) {
      values = defaultValues.slice(0)
      cardsShown = 0
      round = round + 1
      message = "Sucks to suck"
    }

    values[i] = this.state.boardValues[i]
    cardsShown = cardsShown + 1

    if (lastGuess === values[i] && cardsShown === 2) {
      defaultValues = values.slice(0)
      message = "Nice match!"
    }
    if (arrayEquals(defaultValues, this.state.boardValues)) {
      message = "Good Job!"
    }

    lastGuess = values[i]

    this.setState({
      values: values,
      defaultValues: defaultValues,
      cardsShown: cardsShown,
      lastGuess: lastGuess,
      round: round,
      message: message
    })
  }

  render() {
    return (
      <div>
      <div className="game">
        <div className="game-board">
          <Board 
            values = {this.state.values}
            onClick = {(i) => this.handleClick(i)}
          />
        </div>
      </div>
      <div className="game-info">
          <div>{this.state.message}</div>
          <ol>{this.state.round}</ol>
      </div>
      </div>
      
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);


//helper functions
function generateBoard(rows) {
  let halfBoard = (rows * rows / 2) | 0, //get half the board squares and round down. NEed to make sure they pass even products in as cant play a 5x5 game
  shuffledArray = [...Array(halfBoard).keys()].flatMap(i => [i, i]).sort(() => Math.random() - 0.5) //make new array based off size -> duplicate all values for pairs -> randomize order
  return shuffledArray
}

function arrayEquals(a, b) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals(console.log);
