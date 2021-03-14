import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { Alert, Button } from "react-bootstrap"
import '../styles/game.css';
import { socket } from "../../service/socket"

var Board = require('./game.board').default
var GameInfo = require('./game.info').default

function Game(props) {
  const [squares, setSquares] = useState(null)
  const [showLabels, setLabels] = useState(true)
  const [message, setMessage] = useState("")
  const [round, setRound] = useState(0)
  const [error, setError] = useState("loading") //init to game not found so we dont try to load game we dont have
  const [gameFound, setGameFound] = useState(false) 
  const [users, setUsers] = useState([])
  const [cardsShowing, setCardsShowing] = useState(0)
  const history = useHistory();

  if (!props.isAuth) history.push("/login");

  //on first load
  useEffect(() => {
    //ask for our game with token
    socket.emit("joinGameChannel")
    //we should get response with game data
    socket.on("gameInfo", data => {
      console.log('Getting Game info')
      console.log(data)
      setUsers(data.users)
      setMessage(data.message);
      setSquares(data.squares);
      setRound(data.round)
      setCardsShowing(data.cardsShowing)
      setGameFound(true)
    })
    socket.on("error", data => {
      console.log(data)
      setError(data.error.message)
      //setMessage(data.message);
      //setSquares(data.squares);
    })
  }, []);
  const toggleLables = () => {
    setLabels(!showLabels)
  }
  const disableClick = (i) => {
    if (users.length === 0) return false //disable click because for some reason on reload its enabled
    return (cardsShowing >= 2 || users.find(u=>u.upNext).username !== localStorage.getItem('username') || squares[i].value !== "*")
  }
  return (
    <div className="game">
      {!gameFound ?
        <div>
          <Alert variant="danger"> {error} </Alert>
          <Button
            variant="outline-secondary"
            onClick={() => { history.push('/join') }}>
            Join Game
              </Button>
        </div>
        :
        <div>
          <Board
            squares={squares}
            showLabels={showLabels}
            disableClick={disableClick}
          />
          <GameInfo
            round={round}
            message={message}
            showLabels={showLabels}
            setLabels={toggleLables}
            users={users}
          />
        </div>


      }
    </div>
  );
}

export default Game;