import React from 'react';

export default function GameOver(props) {
  //const socket = useContext(SocketContext);
  const { game, handleQuit } = props
  const {message, round, users, id} = game
  const sortByMatches = (users) => {
    return users//.sort((u1, u2) => (u1.matches < u2.matches) ? -1 : 1)
  }
  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <span className="message">{message}</span>
          <span className="round" > Attempts: {round}</span>
        </div>
      </div>
      <div className='leaderBoard'>
        <ol>
          {sortByMatches(users).map(u => {
            return (<li key={u.username}>{u.username} - {u.matches} matches</li>)
          })}
        </ol>
      </div>
      <div className="col">
        <button className="btn btn-primary" onClick={() => { handleQuit("LEAVE_GAME", id) }}>Leave Game</button>
      </div>
    </div>
  )
}