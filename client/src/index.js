import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

function Square(props) {
  let showAnswer = {
    display:(props.data.hidden) ? "block" : "none"
  }
  return (
      <button 
        className="square" 
        onClick={props.onClick}
        style={props.style}>
        {/*front of card*/}
        <img 
          src={props.data.image} 
          alt={props.data.civ}
          className="image"
          />
        {/*back of card*/}
        <img 
          src={props.data.back} 
          alt={props.data.civ}
          className="cardCover"
          style={showAnswer}
        />
        <label>{props.data.civ}</label>
      </button>
  );
}

class Board extends React.Component {
  renderSquare(i, squareHeight) {
    let style = {
      height:squareHeight
    }
    return (
    <Square 
      data={this.props.boardData[i]}
      //this doesnt need to be called onclick just comes in handy 
      onClick= {()=> this.props.onClick(i)}
      key={i}
      style={style}
    />
    )
  }

  createBoard = (size) => {
    let board = [],
        root = Math.sqrt(size) | 0,
        squareIndex = 0
    
    const squareHeight = (100 / root).toString() + "%"
    console.log(root, squareHeight)
    for (let row = 0; row < root; row++) {
      let children = [],
          nextIndex = squareIndex + root
      for (squareIndex; squareIndex < nextIndex; squareIndex++) {
          children.push(this.renderSquare(squareIndex, squareHeight))
      }
      board.push(<div className="row">{children}</div>)
    }
    return <div className="game-board"> {board} </div>
  }

  render() { return this.createBoard(this.props.boardData.length) }
}

class Game extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      boardData: [],
      hiddenIndex: [],
      cardsShown: 0,
      lastGuess: -1,
      round: 0,
      message: "Guess a square"
    }
  }
  componentDidMount(){
    fetch("/api/v1/gameBoard/8").then(response=> response.json()).then((data) => {
      this.setState({
        boardData: data,
        hiddenIndex: data.flatMap(i => i.hidden)
      })
    })
  }
  handleClick(i){
    let hiddenIndex = this.state.current,
        boardData = this.state.boardData,
        cardsShown = this.state.cardsShown,
        message = "Guess a square"

    //if square is already set do nothing
    if (!boardData[i].hidden) return
    //if game over do nothing
    if (!boardData.map(i => i.hidden).contains(true)) return
    //if two cards shown do nothing
    if (cardsShown === 2) return

    //set hidden to no
    hiddenIndex[i] = false
    cardsShown = cardsShown + 1 
    let currentGuess = boardData[i].value

    //if STATE last guess (not the local) == current guess update defaults/message
    if (this.state.lastGuess === currentGuess) { this.recordMatch(); return; }
    //if cards shown is 2 with no match reset board
    else if (cardsShown === 2) { this.resetValues(); return; }
    //if all answers are filled give completed message
    if (!boardData.flatMap(i => i.hidden).contains(true)) message = "All done! Good job!"


    this.setState({
      hiddenIndex: hiddenIndex,
      cardsShown: cardsShown,
      lastGuess: currentGuess,
      message: message
    })
  }

  render() {
    return (
      <div className="container">
        <Board 
          boardData = {this.state.boardData}
          onClick = {(i) => this.handleClick(i)} />
        <div className="game-info">
          <div>{this.state.message}</div>
          <ol>Guesses: {this.state.round}</ol>
        </div>
      </div>
    );
  }
  //reset values 
  resetValues = ()=>{
    let round = this.state.round + 1

    this.setState({
      cardsShown: 2,
      lastGuess: -1,
      round: round,
      message: "No match!"
    })
    setTimeout(()=>{
      this.setState({
        hiddenIndex: this.state.boardData.flatMap(i => i.hidden),
        cardsShown: 0,
        message: "Try Again!"
      })
    }, 1000)
  }
  //update match
  recordMatch = ()=>{
    const hiddenIndex = this.state.hiddenIndex,
          message = "Nice Match!",
          cardsShown = 0,
          lastGuess = -1
    let round = this.state.round + 1,
        newBoardData = this.state.boardData.map((d, i) => {
          let newData = {
            value: d.value,
            image: d.image,
            civ: d.civ,
            hidden: hiddenIndex[i],
            back: d.back
          }
          return newData
        })

    this.setState({
      boardData: newBoardData,
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals(console.log);

