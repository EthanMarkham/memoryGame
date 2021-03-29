import { useContext, useEffect, useState } from 'react'
import { Row, Col, Button } from "react-bootstrap"
import {SocketContext} from '../../context/socket';

export default function GameOver(props) {
  const socket = useContext(SocketContext);
  const { message, round, users, dispatch } = props
  const [nextState, setNextState] = useState("GAME_JOIN")
  const sortByMatches = (users) => {
    return users.sort((u1, u2) => (u1.matches < u2.matches) ? -1 : 1)
  }
  const leaveGame = (nextState) => {
    setNextState(nextState)
    socket.emit("LEAVE_GAME", props.gameInfo.id)
  }
  useEffect(() => {
    socket.on("LEAVE_SUCCESS", () => dispatch({type: nextState}))
    return () => socket.off("LEAVE_SUCCESS", () => dispatch({type: nextState}))
  }, [nextState])

  return (
    <div className="container">
      <Row>
        <Col>
          <span className="message">{message}</span>
          <span className="round" > Attempts: {round}</span>
        </Col>
      </Row>

      <div className='leaderBoard'>
        <ol>
          {sortByMatches(users).map(u => {
            return (<li key={u.username}>{u.username} - {u.matches} matches</li>)
          })}
        </ol>
      </div>

      <Row>
        <Col><Button onClick={() => { leaveGame("GAME_JOIN") }}>Join Game</Button></Col>
        <Col><Button onClick={() => { leaveGame("GAME_NEW") }}>New Game</Button></Col>
      </Row>
    </div>
  )
}