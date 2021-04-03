import { animated as a } from 'react-spring'
const GameInfo = require('./game/game.info').default
const GameBoard = require('./game/game.board').default
const Login = require('./pages/login').default
const GameJoiner = require('./pages/game.join').default
const GameCreator = require('./pages/game.new').default
const GameOver = require('./pages/game.over').default
const Loader = require("react-loader-spinner").default;

const pages = [
    ({style}) => (
        <a.div style={{ ...style }}>
            <Loader className="loader" type="Rings" color="#00BFFF" height={80} width={80} />
        </a.div>
    ),
    ({style, dispatch, state, actions }) => (
        <a.div style={{ ...style }}>
            <GameJoiner dispatch={dispatch} games={state.gameList.games} joinGame={actions.joinGame} />
        </a.div>
    ),
    ({style, dispatch, state, actions }) => (
        <a.div  style={{ ...style }}>
            <GameCreator dispatch={dispatch} addGame={actions.addGame} />
        </a.div>
    ),
    ({style, dispatch, state, actions, squareSprings }) => (
        <a.div style={{ ...style }} className='gameContainer'>
            <GameBoard
                state={state}
                squareSprings={squareSprings}
                handleClick={actions.handleClick}
            />
            <GameInfo
                state={state}
                handleQuit={actions.handleQuit}
                dispatch={dispatch} 
                />
        </a.div>
    ),
    ({style, dispatch}) => (
        <a.div  style={{ ...style }}>
          <Login dispatch={dispatch} />
        </a.div>
    ),
    ({style, dispatch, state}) => (
        <a.div style={{ ...style }}>
          <GameOver state={state} dispatch={dispatch} />
        </a.div>
    ),
]
export default pages