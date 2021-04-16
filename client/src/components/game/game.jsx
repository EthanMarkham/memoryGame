import React, { useContext, useReducer, useEffect } from 'react';
import { SocketContext } from '../../context/socket';
import { useTransition, useSpring, animated as a, useSprings } from 'react-spring'
import { squareAnimations } from '../../helpers/transitions'
const GameInfo = React.lazy(() => import('./game.info'));
const GameOver = require("./game.over").default;

const gameReducer = require('../../reducers/game').default;
const useWindowSize = require('../../hooks/useWindowSize').default;
const gameState = require('../../helpers/initialState').gameState;


export default function Game(props) {
    const rootDispatch = props.dispatch;
    const [state, dispatch] = useReducer(gameReducer, { me: props.me, ...gameState })
    // const [hoverStyle, setHoverStyle] = useSpring(() => ({ xys: [0, 0, 1], config: { mass: 5, tension: 350, friction: 40 } }))
    const windowSize = useWindowSize()
    const socket = useContext(SocketContext);

    const CLEANUP = (mounted) => {
        socket.emit("LEAVE_GAME_ROOM", state.game.id);
        socket.off("GAME_INFO", data => { if (mounted) dispatch({ type: "GAME_INFO", payload: data }) });
        socket.off("GAME_TIMER", time => { if (mounted) dispatch({ type: "GAME_TIMER", payload: time }) });
    }

    useEffect(() => {
        let mounted = true;
        if (mounted) socket.emit("GET_GAME");
        socket.on("GAME_INFO", data => { if (mounted) dispatch({ type: "GAME_INFO", payload: data }) });
        socket.on("GAME_TIMER", time => { if (mounted) dispatch({ type: "GAME_TIMER", payload: time }) });
        return (() => {
            CLEANUP(mounted);
            mounted = false;
        })
    }, [])

    useEffect(() => dispatch({ type: "SET_GRID", payload: windowSize }), [windowSize, state.game.squares.length])

    const actions = {
        toggleLeaveHelp: condition => dispatch({ type: "TOGGLE_LABELS", payload: { type: "LEAVE_INFO", value: condition } }),
        toggleLabelHelp: condition => dispatch({ type: "TOGGLE_LABELS", payload: { type: "LABEL_INFO", value: condition } }),
        toggleGameLabels: condition => dispatch({ type: "TOGGLE_LABELS", payload: { type: "GAME_INFO", value: condition } }),
        handleQuit: _ => (state.game.status !== "GAME_OVER") ? socket.emit("QUIT_GAME") : socket.emit("GET_STATUS"),
        handleClick: id => socket.emit("GAME_CLICK", id)
    }

    const squareSprings = useTransition(state.game.squares, item => item.id, squareAnimations);
    const flipSprings = useSprings(state.game.squares.length, state.game.squares.map(s => ({
        opacity: s.flipped ? 1 : 0,
        transform: `perspective(600px) rotateY(${s.flipped ? 180 : 0}deg)`,
        config: { mass: 5, tension: 500, friction: 80 }
    })));

    return (
        <div className="game">
            {state.game.status !== "GAME_OVER" ?

                <div className="game-board"
                    style={{
                        gridTemplateColumns: `repeat(${state.gridSize[0]}, minmax(20px, 1fr))`,
                        gridTemplateRows: `repeat(${state.gridSize[1]}, minmax(20px, 1fr))`,
                    }}>
                    {state.game.squares.length > 0 && squareSprings.map(({ props, item, key }, i) => {
                        return (<a.div
                            style={{ ...props }}
                            key={key}
                            className="squareHolder">
                            <button
                                className="square"
                                onClick={() => actions.handleClick(item.id)}
                                disabled={!item.clickable}>
                                {state.labels.card && <label>{item.civ}</label>}
                                <a.div className="c back" style={{ opacity: flipSprings[i].opacity.interpolate(o => 1 - o), transform: flipSprings[i].transform }} />
                                <a.div className="c front" style={{
                                    opacity: flipSprings[i].opacity,
                                    transform: flipSprings[i].transform.interpolate(t => `${t} rotateY(180deg)`),
                                    backgroundImage: `url(http://localhost:5000/${item.image})`
                                }} />
                            </button>
                        </a.div>
                        )
                    })}
                    {/*state.game.squares.length > 0 && flipSprings.map(({opacity, transform}, i) => {
                        let item = state.game.squares[i];
                        return (<div
                            key={item.id}
                            className="squareHolder">
                            <button
                                className="square"
                                onClick={() => actions.handleClick(item.id)}
                                disabled={!item.clickable}>
                                {state.labels.card && <label>{item.civ}</label>}
                                <a.div class="c back" style={{ opacity: opacity.interpolate(o => 1 - o), transform }} />
                                <a.div class="c front" style={{ 
                                    opacity, 
                                    transform: transform.interpolate(t => `${t} rotateY(180deg)`),
                                    backgroundImage: `url(http://localhost:5000/${item.image})` 
                                    }} 
                                />
                            </button>
                        </div>
                        )
                    })*/}
                </div>
                : <GameOver state={state} dispatch={dispatch} />
            }
            <GameInfo
                game={state.game}
                me={props.me}
                actions={actions}
                helpers={state.labels}
                moveTimer={state.moveTimer}
            />
        </div>)
}
const GameSquare = ({ id, clickable, showLabels, civ, image, handleClick }) => {
    return (
        <button
            className="square"
            onClick={() => handleClick(id)}
            disabled={!clickable}>
            {showLabels && <label>{civ}</label>}
            <a.div className="back"></a.div>
            <a.div className="back"></a.div>
        </button>
    )
}