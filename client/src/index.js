import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button 
      className="square" 
      onClick={props.onClick}
    >
    <img 
      src={props.image} 
      alt={props.value}
      className="image"
      ></img>
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
    <Square 
      value={this.props.squares[i].value}
      image={this.props.squares[i].image}
      //this doesnt need to be called onclick just comes in handy 
      onClick= {()=> this.props.onClick(i)}
      key={i}
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

  render() { return ( <div>{this.createBoard(this.props.squares.length)}</div> ) }
}

class Game extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      answerSquares: [],
      currentSquares: [],
      defaultSquares: [],
      cardsShown: 0,
      lastGuess: -1,
      round: 0,
      message: "Guess a square"
    }
  }
  componentDidMount(){
    fetch("/api/v1/gameBoard").then(response=> response.json()).then((data) => {
      let defaultSquares = Array(data.length).fill({value:"*", image:"/cards/back.PNG"})
      console.log(data);
      this.setState({
        answerSquares: data,
        currentSquares: defaultSquares.slice(0),
        defaultSquares: defaultSquares.slice(0),
      })

    })
  }
  handleClick(i){
    let currentSquares = this.state.currentSquares,
        defaultSquares = this.state.defaultSquares,
        cardsShown = this.state.cardsShown,
        lastGuess = this.state.lastGuess,
        round = this.state.round,
        message = "Guess a square"
  console.log(defaultSquares)

   //if square or winner set do nothing
    if (this.state.waiting) return
    //if square is already set do nothing
    if (currentSquares[i].value !== "*" || "*" !== defaultSquares[i].value) return
    //if game over do nothing
    if (arrayEquals(defaultSquares, this.state.answerSquares)) return

    //if two cards match check for winner and flip over
    if (cardsShown === 2) {
      currentSquares = defaultSquares.slice(0)
      cardsShown = 0
      round = round + 1
      message = "Try Again!"
    }

    currentSquares[i] = this.state.answerSquares[i]
    cardsShown = cardsShown + 1

    //have to check that cardshown is 2 otherwise it would be match if they selected 9, hid all squares and selected 9 again
    if (lastGuess === currentSquares[i].value && cardsShown === 2) {
      //record new match in default values
      defaultSquares = currentSquares.slice(0)
      message = "Nice Match!"
    }
    if (arrayEquals(defaultSquares, this.state.answerSquares)) {
      message = "Good job!"
    }
    lastGuess = currentSquares[i].value

    this.setState({
      currentSquares: currentSquares,
      defaultSquares: defaultSquares,
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
            squares = {this.state.currentSquares}
            onClick = {(i) => this.handleClick(i)}
          />
        </div>
      </div>
      <div className="game-info">
          <div>{this.state.message}</div>
          <ol>Guesses: {this.state.round}</ol>
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

