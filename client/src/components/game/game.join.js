import React, { useState, useEffect } from "react";
import { Alert, Form, Button } from "react-bootstrap"
import { socket } from "../../configs/socket.config"
import { useHistory } from "react-router-dom";
import { useLocalStorage } from "../../hooks/useLocalStorage";

function GameJoiner(props) {
  const history = useHistory();
  const [redirctTo, setRedirctTo] = useState(""); // your state value to manipulate

  const [newGame, toggleNew] = useState(false)
  const [gameName, setGameName] = useState("");
  const [playerCount, setPlayerCount] = useState(1);
  const [error, setError] = useState("");
  const [games, setGames] = useState([]);

  const [jwt] = useLocalStorage("jwt", localStorage.getItem('jwt'));

  //rewritting these to avoid dependencies in render and prevent memory leaks?
  const toggleJoin = () => { toggleNew(!newGame) }
  const updateGameName = (newName) => { setGameName(newName) }
  const updatePlayerCount = (newCount) => { setPlayerCount(newCount) }
  //redirect if not logged in
  if (!jwt) setRedirctTo('/login')
    //redirect down here so history not passed to useEffect
  if (redirctTo !== "") {
    history.push(redirctTo)
  }
  //sockets
  useEffect(() => {
    let isMounted = true

    if (isMounted) socket.emit("listGames");
    socket.on("games", data => {if (isMounted) setGames(data)})
    socket.on("joinSuccess", joinSuccess => {
      if (isMounted) {
        if (joinSuccess) {
          console.log("game joined redirecting to game")
          setRedirctTo('/game')
        }
        else {
          console.log('join failed')
          console.log(joinSuccess)
          setError(joinSuccess.error)
        }
      }
    })

    return () => { isMounted = false }
  }, [])

  return (
    <div className="container">
      {error && <Alert variant="danger"><b>Error!</b> <ul>{error.messages.map(e => <li>{e}</li>)}</ul></Alert>}

      <Button
        variant="outline-secondary"
        onClick={() => { toggleJoin() }}
        block
      >
        {newGame ? "List Games" : "New Game"}
      </Button>


      {newGame
        ? <NewGameForm
          gameName={gameName}
          setGameName={updateGameName}
          setPlayerCount={updatePlayerCount}
          playerCount={playerCount}
        />
        : <GameList games={games} />}

    </div>
  )

}
function GameList(props) {
  return (
    <div className="gameList">
      <h2>{props.games.length} games found!</h2>
      <ul className="list-group">
        {props.games.map(g => () => { return <li className='list-group-item'>{g.id}</li> })}
      </ul>
    </div>
  )
}

function NewGameForm(props) {

  function addGame(event) {
    event.preventDefault();
    console.log("adding game")
    socket.emit("addGame", { name: props.gameName, playerCount: props.playerCount })
  }
  return (
    <Form onSubmit={addGame}>
      <Form.Group>
        <Form.Label>Name:</Form.Label>
        <Form.Control
          type="text"
          size="lg"
          placeholder="Enter Lobby Name"
          onChange={(event) => { props.setGameName(event.target.value) }}
          value={props.gameName}
        />
      </Form.Group>
      <br />

      <Form.Group controlId="exampleForm.ControlSelect1">
        <Form.Label>Number of Players</Form.Label>
        <Form.Control
          as="select"
          onChange={(event) => { props.setPlayerCount(event.target.value) }}
          value={props.playerCount}
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
        </Form.Control>
      </Form.Group>
      <br />

      <Button
        variant="primary"
        type="submit"
        disabled={props.gameName === ""}
        block
      >
        Create Game
      </Button>

    </Form>
  )
}
export default GameJoiner;