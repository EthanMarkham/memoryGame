import React, { useState, useEffect } from 'react';
import { Alert, Button } from "react-bootstrap"
import { useHistory } from "react-router-dom";
import '../../styles/game.css';
import { useLocalStorage } from "../../hooks/useLocalStorage";
var socket = require("../../configs/socket.config").socket

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
  const [gameOver, setGameOver] = useState(false)

  const history = useHistory();
  const [jwt] = useLocalStorage("jwt", localStorage.getItem('jwt'));

  if (!jwt) history.push("/login");

  //on first load
  useEffect(() => {
    let isMounted = true
    if (isMounted) socket.emit("joinGameChannel")
    //we should get response with game data
    socket.on("gameInfo", data => {
      if (isMounted) {
        setUsers(data.users)
        setMessage(data.message);
        setSquares(data.squares);
        setRound(data.round)
        setCardsShowing(data.cardsShowing)
        setGameFound(true)
      }
    })
    socket.on("gameOver", data => {
      if (isMounted) {
        setUsers(data.users)
        setMessage(data.message);
        setSquares(data.squares);
        setRound(data.round)
        setCardsShowing(2)
        setGameOver(true)
      }
    })
    socket.on("error", data => {
      if (isMounted) {
        console.log(data)
        setError(data)
      }
    })
    return () => { isMounted = false }
  }, []);

  const joinGame = () => {
    history.push('/join')
  }
  const toggleLables = () => {
    setLabels(!showLabels)
  }
  const disableClick = (i) => {
    if (users.length === 0) return false //disable click because for some reason on reload its enabled
    return (cardsShowing >= 2 || users.find(u => u.upNext).username !== localStorage.getItem('username') || squares[i].value !== "*")
  }
  return (
    <div className="game">
      {!gameFound ?
        <div>
          <Alert variant="danger"> {error} </Alert>
          <Button
            variant="outline-secondary"
            onClick={() => joinGame()}>
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
            gameOver={gameOver}
            history={props.history}
          />
        </div>


      }
    </div>
  );
}

export default Game;