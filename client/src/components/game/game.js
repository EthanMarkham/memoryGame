import React, {
  useState,
  useEffect
} from 'react';
import '../styles/game.css';
var Board = require('./board').default

function Game() {
  const [answerSquares, setAnswerSquares] = useState([])
  const [currentSquares, setCurrentSquares] = useState([])
  const [defaultSquares, setDefualtSquares] = useState([])
  const [showLabels, setLabels] = useState(true)
  const [cardsShown, setCardsShown] = useState(0)
  const [currentGuess, setCurrentGuess] = useState(-1)
  const [lastGuess, setLastGuess] = useState(-1)
  const [round, setRound] = useState(0)
  const [message, setMessage] = useState(0)
  
  //Helper Functions
  const startNewGame = () => {
    fetch("api/game/create").then(response => response.json()).then((data) => {
      let newSquares = Array(data.length).fill({
        value: "*",
        image: "/cards/back.PNG"
      })
      setAnswerSquares(data)
      setCurrentSquares(newSquares.slice())
      setDefualtSquares(newSquares.slice())
      setCardsShown(0)
      setLastGuess(-1)
      setRound(0)
      setMessage("Guess a Square!")
    })
  }
  const resetValues = (newMsg) =>{
    setCardsShown(2)
    setLastGuess(-1)
    setRound(round => round + 1)
    setMessage(newMsg)
  
    //delay then auto flip cards back
    setTimeout(() => {
      setCurrentSquares(defaultSquares)
      setCardsShown(0)
      setMessage("Guess A Square")
    }, 1500)
  }
  const handleClick = (i) => {
    //if current square already set || cards over 2 do nothing
    if (currentSquares[i].value !== "*" || "*" !== defaultSquares[i].value || cardsShown === 2) return

    //set button to the click and cards shown to plus 1
    let newSquares = currentSquares.slice()
    newSquares[i] = answerSquares[i]

    setLastGuess(currentGuess)
    setCurrentGuess(newSquares[i].value)
    setCurrentSquares(newSquares)
    setCardsShown(cardsShown + 1)
  }

  //HOOKS

  //on first load
  useEffect(() => {
    startNewGame()
  }, [])

  //everytime default cards updated look to see if game over
  useEffect(()=>{
    if (defaultSquares.map(s => s.value).indexOf('*') === -1) {
      setCardsShown(3) //this will break it so they cant click more
      setMessage(`Good job! It took you ${round + 1} guesses`)
    }
  }, defaultSquares)

  //everytime current guess updateda check for match
  useEffect(() => {
    if (cardsShown === 2) {
      //if STATE last guess (not the local) == current guess update defaults/message
      if (lastGuess === currentGuess) {
        //map current squares with new match color --Add in current user.color to get people
        let newDefault = currentSquares.map(s => {
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
        setDefualtSquares(newDefault)
        resetValues("Nice Match!") 
        return
      }

      //if cards shown is 2 with no match update current vals and reset board
      else {
        resetValues("No Match! Try Again!")
        return
      }
    }
  }, [currentGuess])

  return ( 
    <div className = "game">
      <Board 
        squares = {currentSquares}
        onClick = {(i) => handleClick(i)}
        showLabels = {showLabels}
      /> 
      <div className = "game-info">
        <div className = "col">
          <span className = "message">{message}</span>
          <span className = "round" > Attempts: {round}</span>
        </div>
        <div className = "col">
          <button 
            className = "restartBtn"
            onClick = {() => {setLabels(!showLabels)}}>Toggle Labels</button>
          <button 
            className = "restartBtn"
            onClick = {() => {startNewGame()}}>Restart</button>
        </div>
      </div>
    </div>
  );
}

export default Game;