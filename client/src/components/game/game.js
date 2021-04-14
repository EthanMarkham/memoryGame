import React, { useCallback, useReducer, useEffect } from 'react';
import { SocketContext } from 'context/socket';
const GameInfo = React.lazy(() => import('./game.info2'));
const GameOver = require("./game.over").default;
const gameReducer = require('../..//reducers/game').default
const useWindowSize = require('../../hooks/useWindowSize').default

export default function Game(props) {
    const [state, dispatch] = useReducer(gameReducer, {me: props.me, ...gameState})
    // const [hoverStyle, setHoverStyle] = useSpring(() => ({ xys: [0, 0, 1], config: { mass: 5, tension: 350, friction: 40 } }))
    const windowSize = useWindowSize()
    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.emit("GET_GAME_INFO");
        socket.on("GAME_INFO", data => dispatch({ type: "GAME_INFO", payload: data }));
        socket.on("GAME_TIMER", time => dispatch({ type: "GAME_TIMER", payload: time }));
        return (() => {
            socket.off("GAME_INFO", data => dispatch({ type: "GAME_INFO", payload: data }));
            socket.off("GAME_TIMER", time => dispatch({ type: "GAME_TIMER", payload: time }));
        })
    }, [])

    useEffect(() => dispatch({ type: "SET_GRID", payload: windowSize }), [windowSize, state.game.squares.length])

    const actions = {
        toggleLeaveHelp: useCallback(condition => dispatch({ type: "TOGGLE_LABELS", payload: { type: "LEAVE_INFO", value: condition } }), [state.labels.leaveInfo, condition]),
        toggleLabelHelp: useCallback(condition => setLeaveHelper(condition), [state.labels.labelInfo]),
        toggleGameLabels: _ => useCallback(condition => dispatch({ type: "TOGGLE_LABELS", payload: { type: "GAME_INFO", value: condition } }), [state.labels.card, condition]),
        handleQuit: id => socket.emit("QUIT_GAME", id),
        handleClick: id => socket.emit("GAME_CLICK", id)
    }
    //const squareSprings = useSprings(state.game.squares.length, items.map(item => ({ opacity: item.opacity })))
    return (
        <div className="game">
            {state.game.status !== "GAME_OVER" ?

                <div className="game-board"
                    style={{
                        gridTemplateColumns: `repeat(${state.gridSize[0]}, minmax(20px, 1fr))`,
                        gridTemplateRows: `repeat(${state.gridSize[1]}, minmax(20px, 1fr))`,
                    }}>
                    {state.squares.map(s => {
                        return (
                            <a.div
                                //style={style} //transform: hoverStyle.xys.interpolate(trans)
                                key={s.id}
                                className="squareHolder"
                            //onMouseMove={({ clientX: x, clientY: y }) => setHoverStyle({ xys: calc(x, y) })}
                            //onMouseLeave={() => setHoverStyle({ xys: [0, 0, 1] })}
                            >
                                <GameSquare
                                    {...s}
                                    handleClick={actions.handleClick}
                                    showLabels={state.labels.card} />
                            </a.div>
                        )
                    })}
                </div>
                : <GameOver state={state} dispatch={dispatch} />
            }
            <GameInfo
                state={state}
                handleQuit={actions.handleQuit}
                dispatch={dispatch}
            />
        </div>)
}
const GameSquare = ({ id, clickable, showLabels, civ, image, handleClick }) => {
    return (
        <button
            className="square"
            onClick={() => handleClick(id)}
            style={{ backgroundImage: `url(http://localhost:5000/${image})` }}//;fix show labels
            disabled={!clickable}>
            {showLabels && <label>{civ}</label>}
        </button>
    )
}