import { Alert, Form, Row, Col, Button } from "react-bootstrap"

export default function gameOver(props) {
  const { setGameState } = props.gameStates
  const { message, round, users } = props.gameInfo

  const sortByMatches = (users) => {
    return users.sort((u1, u2) => (u1.matches < u2.matches) ? -1 : 1)
  }
  return (
    <div>
      <Row>
        <Col>
          <span className="message">{message}</span>
          <span className="round" > Attempts: {round}</span>
        </Col>
      </Row>

      <div className='leaderBoard'>
        <ol>
          {sortByMatches(users).map(u => {
            return (<li>{users.username} - {users.matches} matches</li>)
          })}
        </ol>
      </div>

      <Row>
        <Col><Button onClick={() => { setGameState("GAME_JOIN") }}>Join Game</Button></Col>
        <Col><Button onClick={() => { setGameState("GAME_NEW") }}>Join Game</Button></Col>
      </Row>
      

    </div>
  )
}
