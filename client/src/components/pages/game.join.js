import { Transition } from 'react-spring/renderprops'


function GameJoiner(props) {
  const { dispatch, games, joinGame } = props
  const GameInfo = (props) => {
    return (
    <button className="row gameList" onClick={() => {joinGame(props.game.id)}}>
      <div className="col-8"><h3>{props.game.name}</h3></div>
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
      <div className="gameList">
        <h2>{games.length} games found!</h2>
        {games.length > 0 && <Transition
          items={games} keys={item => item.id}
          from={{ transform: 'translate3d(0,-40px,0)' }}
          enter={{ transform: 'translate3d(0,0px,0)' }}
          leave={{ transform: 'translate3d(0,-40px,0)' }}>
          {item => props => <div style={props}>{<GameInfo game={item}/>}</div>}
        </Transition>}
      </div>
      <div className="row">
        <div className="col"><button className="btn btn-primary btn-large btn-block" onClick={() => { dispatch({type: "SWITCH_PAGE", payload: {pageIndex: 2}}) }} >New Game</button></div>
      </div>
        
    </div>
  )
}
export default GameJoiner


