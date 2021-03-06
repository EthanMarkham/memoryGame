import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';

function Square(props) {
  return (
      <button 
        className="square" 
        onClick={props.onClick}
        style={props.style}>
        <img 
          src={props.image} 
          alt={props.civ}
          className="image"
          />
        {props.showLabels && <label>{props.civ}</label>}
      </button>
  );
}

class Board extends React.Component {
  renderSquare(i, showLabels) {
    //if match color not set set the match color to square match color
    let style = {}

    if (this.props.squares[i].matchColor != null) style['borderColor'] = this.props.squares[i].matchColor
    //pass data to square props
    return (
    <Square 
      value={this.props.squares[i].value}
      image={this.props.squares[i].image}
      civ={this.props.squares[i].civ}
      //this doesnt need to be called onclick just comes in handy 
      onClick={()=> this.props.onClick(i)}
      showLabels={this.props.showLabels}
      key={i}
      style={style}
    />
    )
  }
  //function to create board
  createBoard = () => {
    let board = []
    for (let squareIndex = 0; squareIndex < this.props.squares.length; squareIndex++) {
      board.push(this.renderSquare(squareIndex))
    }
    
    return <div className="game-board"> {board} </div>
  }

  render() { return this.createBoard(this.props.squares.length) }
}

class Game extends React.Component {
  constructor(props){
    super(props)
    //init all state vars
    this.state = { 
      answerSquares: [],
      currentSquares: [],
      defaultSquares: [],
      showLabels: true,
      cardsShown: 0,
      lastGuess: -1,
      round: 0,
      message: "Guess a square"
    }
  }
  componentDidMount(){
    this.startNewGame()
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
    if (defaultSquares.map(s=>s.value).indexOf('*') === -1) return
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
      <div className="container">
        <header><h1>AOE2 Memory</h1></header>
        <Board 
          squares = {this.state.currentSquares}
          onClick = {(i) => this.handleClick(i)} 
          showLabels = {this.state.showLabels}
        />
        <div className="game-info">
          <div className="col">
            <span className="message">{this.state.message}</span>
            <span className="round">Attempts: {this.state.round}</span>
          </div>
          <div className="col">
            <button 
              className="restartBtn" 
              onClick={() => {
                let showLabels = !this.state.showLabels
                this.setState({
                  showLabels:showLabels
                })
              }}>
              Toggle Labels
              </button>
              <button 
                onClick={this.startNewGame}>
                Restart
              </button>
          </div>

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
    }, 1500)
  }
  //update match
  recordMatch = ()=>{
    let message = "Nice Match!",
        cardsShown = 0,
        lastGuess = -1,
        round = this.state.round + 1,
        currentSquares = this.state.currentSquares.map(s => {
          let output = {
            value: s.value,
            image: s.image,
            civ: s.civ,
          }
          if (s.value !== "*" && !s.matchColor) {
            output['matchColor'] = "green" //add in which team gets it later on
            output['borderWidth'] = "2px"

          }
          return output
        })
    //if all answers are filled game over completed message
    if (currentSquares.map(s=>s.value).indexOf('*') === -1) message = `Good job! It took you ${round} guesses`
    this.setState({
      currentSquares: currentSquares.slice(0),
      defaultSquares: currentSquares.slice(0),
      cardsShown: cardsShown,
      lastGuess: lastGuess,
      round: round,
      message: message
    })
  }
 //start new game
  startNewGame = ()=>{
    fetch("/api/v1/gameBoard").then(response=> response.json()).then((data) => {
      let defaultSquares = Array(data.length).fill({value:"*", image:"/cards/back.PNG"})
      this.setState({
        answerSquares: data,
        currentSquares: defaultSquares.slice(0),
        defaultSquares: defaultSquares.slice(0),
        cardsShown: 0,
        lastGuess: -1,
        round: 0,
        message: "Guess a square"
      })

    })
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);

