import React, { useState, useEffect, useCallback, useContext } from "react";
import { Alert, Row, Col, Button } from "react-bootstrap"
import {SocketContext} from '../../context/socket';


function GameJoiner(props) {
  const { error, setGameState } = props.gameStates
  const [games, setGames] = useState([]);
  const socket = useContext(SocketContext);

  let isMounted = false

  const handleGameList = useCallback(data => {
    setGames(data)
  }, [])
  useEffect(() => {
    if (!isMounted) {
      isMounted = true
      socket.emit("listGames")
      socket.on("GAME_LIST", data => handleGameList(data))
    }
    return () => { 
      socket.off("GAME_LIST", data => handleGameList(data))
      isMounted = false; 
    }
  }, [])

  return (
    <div className="container">
      {error && <Alert variant="danger"><b>Error!</b> {error} </Alert>}

      <div className="gameList">
        <h2>{games.length} games found!</h2>
        <ul className="list-group">
          {games.map(g => () => { return <li className='list-group-item'>{g.id}</li> })}
        </ul>
      </div>
      <Row>
        <Col><Button onClick={() => { setGameState("GAME_NEW") }} variant="primary" type="submit" block>New Game</Button></Col>
      </Row>
    </div>
  )
}
export default GameJoiner


