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
      <label>{props.civ}</label>
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
    <Square 
      value={this.props.squares[i].value}
      image={this.props.squares[i].image}
      civ={this.props.squares[i].civ}
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
    fetch("/api/v1/gameBoard/6").then(response=> response.json()).then((data) => {
      let defaultSquares = Array(data.length).fill({value:"*", image:"/cards/back.PNG"})
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
        round = this.state.round,
        message = "Guess a square"

   //if square or winner set do nothing
    if (this.state.waiting) return
    //if square is already set do nothing
    if (currentSquares[i].value !== "*" || "*" !== defaultSquares[i].value) return
    //if game over do nothing
    if (arrayEquals(defaultSquares, this.state.answerSquares)) return
    //if two cards shown do nothing
    if (cardsShown === 2) return

    //set button to the click and cards shown to plus 1
    currentSquares[i] = this.state.answerSquares[i]
    cardsShown = cardsShown + 1 
    let currentGuess = currentSquares[i].value

    //if STATE last guess (not the local) == current guess update defaults/message
    if (this.state.lastGuess === currentSquares[i].value) { this.recordMatch(); return; }
    //if cards shown is 2 with no match reset board
    else if (cardsShown === 2) { this.resetValues(); return; }
    //if all answers are filled give completed message
    if (arrayEquals(defaultSquares, this.state.answerSquares)) message = "Good job!"


    this.setState({
      currentSquares: currentSquares,
      defaultSquares: defaultSquares,
      cardsShown: cardsShown,
      lastGuess: currentGuess,
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
  //reset values 
  resetValues = ()=>{
    let round = this.state.round + 1,
      defaultSquares = this.state.defaultSquares

    this.setState({
      cardsShown: 2,
      lastGuess: -1,
      round: round,
      message: "No match!"
    })
    setTimeout(()=>{
      this.setState({
        currentSquares: defaultSquares.slice(),
        defaultSquares: defaultSquares.slice(),
        cardsShown: 0,
        message: "Try Again!"
      })
    }, 1000)
  }
  //update match
  recordMatch = ()=>{
    const currentSquares = this.state.currentSquares,
          message = "Nice Match!",
          cardsShown = 0,
          lastGuess = -1
    let round = this.state.round + 1

    this.setState({
      currentSquares: currentSquares.slice(0),
      defaultSquares: currentSquares.slice(0),
      cardsShown: cardsShown,
      lastGuess: lastGuess,
      round: round,
      message: message
    })
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

