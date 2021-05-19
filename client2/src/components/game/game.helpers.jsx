
export const UserStats = props => {
  return (
    <div className="userStats col-5">
      {props.users.map((u => (<div key={u.username} className="stat">
        <div style={{ backgroundColor: u.color }} className="userColor" />
        <div className="userText">{u.username} - Matches: {u.matches}</div>
      </div>)))}
    </div>)
}

export const GameStats = props => {
  var { me, status, users, round, message, time, timerEnabled } = props;
  const nextTurn = (users.find(u => u.upNext)) ? users.find(u => u.upNext).username : "";

  if (status === "RESETTING") message = "Remember This!";
  else if (status === "GAME_OVER") message = "GG!";
  else if (nextTurn !== me) message = `${nextTurn} is up`;

  return (
    <div className="gameStats">
      <div id='game-message' className="stat">{message}</div>
      <div id='round-message' className="stat" ><label>Guesses:</label><span className='info'>{round}</span></div>
    </div>
  )
}

export const GameControl = ({ toggleGameLabels, handleQuit }) => {
  return (<div className="gameControl">
    <GameButton
      key={'gameLabelButton'}
      buttonText='LABELS'
      svg={InfoIcon}
      onClick={() => toggleGameLabels()} />
    <GameButton
      key={'gameLeaveButton'}
      buttonText='QUIT'
      svg={LeaveIcon}
      onClick={() => { if (window.confirm('Are you sure you wish to leave this game?')) handleQuit() }} />
  </div>)
}

const GameButton = ({ onClick, buttonText, svg }) => {
  const SvgIcon = () => svg();
  //onMouseOver={() => toggleHelp(true)}
  //onMouseLeave={() => toggleHelp(false)}
  return (<div className="gameButton">
    <button
      className="btn"
      onClick={() => onClick()}>
      <SvgIcon />
      <label htmlFor="showLabels">{buttonText}</label>
    </button>
  </div>)
}


const InfoIcon = _ => (<svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" className="bi bi-info-square" viewBox="0 0 16 16">
  <g fill="currentColor">
    <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
    <path d="M8.93 6.588l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
  </g>
</svg>)

const LeaveIcon = _ => (<svg xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 24 24" width="1.5em"><path d="M0 0h24v24H0z" fill="none" />
  <g fill="currentColor">
    <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
  </g></svg>)