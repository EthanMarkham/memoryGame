import React, { useState, useEffect, useCallback, useContext } from "react";
import { Alert, Row, Col, Button } from "react-bootstrap"
import { SocketContext } from '../../context/socket';
import { Transition } from 'react-spring/renderprops'


function GameJoiner(props) {
  const { error, setGameState } = props.gameStates
  const [games, setGames] = useState([]);
  const socket = useContext(SocketContext);

  const handleGameList = useCallback(data => {
    setGames(data)
  }, [setGames])

  useEffect(() => {
    socket.emit("LIST_GAMES")
    socket.on("GAME_LIST", data => handleGameList(data))

    return () => {
      socket.off("GAME_LIST", data => handleGameList(data))
    }
  }, [])

  const joinGame = (gameId) => {
    socket.emit("ADD_ME_TO_GAME", gameId)
  }
  const GameInfo = (props) => {
    return (
    <button className="row gameList" onClick={() => {joinGame(props.game.id)}}>
      <div className="col-8"><h3>{props.game.id}</h3></div>
      <div className="col-4">
        <div className="gameStats">
          <div className="stat">Players: {props.game.players}</div>
          <div className="stat">Out of: {props.game.maxPlayers}</div>
        </div>
      </div>
    </button>)
  }
  return (
    <div className="container">
      {error && <Alert variant="danger"><b>Error!</b> {error} </Alert>}

      <div className="gameList">
        <h2>{games.length} games found!</h2>
        <Transition
          items={games} keys={item => item.id}
          from={{ transform: 'translate3d(0,-40px,0)' }}
          enter={{ transform: 'translate3d(0,0px,0)' }}
          leave={{ transform: 'translate3d(0,-40px,0)' }}>
          {item => props => <div style={props}>{<GameInfo game={item}/>}</div>}
        </Transition>
      </div>
      <Row>
        <Col><Button onClick={() => { setGameState("GAME_NEW") }} variant="primary" type="submit" block>New Game</Button></Col>
      </Row>
        
    </div>
  )
}
export default GameJoiner


