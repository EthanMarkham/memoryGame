import { useState, useEffect, useContext, useCallback } from "react";
import { Col, Row, Form, Button } from "react-bootstrap"
import { SocketContext } from '../../context/socket';

function NewGameForm(props) {
  const socket = useContext(SocketContext);

  const { setGameState } = props
  const [gameName, setGameName] = useState("");
  const [playerCount, setPlayerCount] = useState(1);
  const [error, setError] = useState("");

  const handleError = useCallback((err) => {
    console.log(err)
    setError(err)
  }, [setError])

  useEffect(() => {
    socket.on("ADD_ERROR", (err) => handleError(err))
    return (() => {
      socket.off("ADD_ERROR", (err) => handleError(err))
    })
  }, [])

  function addGame(event) {
    event.preventDefault();
    console.log("adding game")
    socket.emit("ADD_GAME", { name: gameName, playerCount: playerCount })
  }

  return (
    <div className="container">
      <Form onSubmit={addGame}>
        <Form.Group>
          <Form.Label>Name:</Form.Label>
          <Form.Control
            type="text"
            size="lg"
            placeholder="Enter Lobby Name"
            onChange={(event) => { setGameName(event.target.value) }}
            value={gameName}
          />
        </Form.Group>
        <br />

        <Form.Group controlId="exampleForm.ControlSelect1">
          <Form.Label>Number of Players</Form.Label>
          <Form.Control
            as="select"
            onChange={(event) => { setPlayerCount(event.target.value) }}
            value={playerCount}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </Form.Control>
        </Form.Group>
        <br />
        <Row>
          <Col><Button onClick={() => { setGameState("GAME_JOIN") }} variant="secondary" type="submit" block>Join Game</Button></Col>
          <Col><Button variant="primary" type="submit" disabled={gameName === ""} block>Create Game</Button></Col>
        </Row>

      </Form>
    </div>
  )
}
export default NewGameForm;
