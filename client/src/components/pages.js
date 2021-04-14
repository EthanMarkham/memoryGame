import React from 'react';
const GameInfo = React.lazy(() => import('./game/game.info'));
const GameBoard = require('./game/game.board').default
const Login =  React.lazy(() => import('./pages/login'));
const GameJoiner = require('./pages/game.join').default
const GameCreator = require('./pages/game.new').default
const GameOver = require('./pages/game.over').default
const Loader = require("react-loader-spinner").default;

const pages = [
    () => <Loader className="loader" type="Rings" color="#00BFFF" height={80} width={80} />,
    ({dispatch, state, actions }) => <GameJoiner dispatch={dispatch} games={state.gameList.games} joinGame={actions.joinGame} />,
    ({dispatch, actions }) => <GameCreator dispatch={dispatch} addGame={actions.addGame} />,
    ({dispatch, state, actions }) => (
        <>
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
        </>
    ),
    ({dispatch}) => <Login dispatch={dispatch} />,
    ({dispatch, state}) => <GameOver state={state} dispatch={dispatch} />,
]
export default pages