import React from 'react';
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
        <a.div className='animatedDiv' style={{ ...style }}>
            <Loader className="loader" type="Rings" color="#00BFFF" height={80} width={80} />
        </a.div>
    ),
    ({style, dispatch, state, actions }) => (
        <a.div className='animatedDiv' style={{ ...style }}>
            <GameJoiner dispatch={dispatch} games={state.gameList.games} joinGame={actions.joinGame} />
        </a.div>
    ),
    ({style, dispatch, state, actions }) => (
        <a.div  className='animatedDiv' style={{ ...style }}>
            <GameCreator dispatch={dispatch} addGame={actions.addGame} />
        </a.div>
    ),
    ({style, dispatch, state, actions }) => (
        <a.div className='animatedDiv' style={{ ...style }}>
            <GameBoard
                state={state}
                dispatch={dispatch}
                actions={actions}
            />
            <GameInfo
                state={state}
                handleQuit={actions.handleQuit}
                dispatch={dispatch} 
                />
        </a.div>
    ),
    ({style, dispatch}) => (
        <a.div  className='animatedDiv' style={{ ...style }}>
          <Login dispatch={dispatch} />
        </a.div>
    ),
    ({style, dispatch, state}) => (
        <a.div className='animatedDiv' style={{ ...style }}>
          <GameOver state={state} dispatch={dispatch} />
        </a.div>
    ),
]
export default pages