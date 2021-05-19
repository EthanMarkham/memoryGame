import React, { useContext, useReducer, useEffect, useCallback, useState } from 'react';
import { SocketContext } from '../../context/socket';
import { useTransition, useSpring, useSprings, animated as a } from 'react-spring'
import { squareTransitions, flipAnimations, hideGameInfo, gameOverTransition, hideBoardAnimation } from '../../helpers/transitions'

const { GameControl, UserStats, GameStats } = require('./game.helpers');
const CountdownTimer = require('../timer/timer').default;
const GameOver = require("./game.over").default;
const gameReducer = require('../../reducers/game').default;
const useWindowSize = require('../../hooks/useWindowSize').default;
const useTimer = require('../../hooks/useTimer').default;

const gameState = require('../../helpers/initialState').gameState;

const SERVER_URL = "http://localhost:5000";

export default function Game(props) {
    const [state, dispatch] = useReducer(gameReducer, { me: props.me, ...gameState });
    const windowSize = useWindowSize();

    const [time, toggleTimer] = useTimer(45, () => { });

    const socket = useContext(SocketContext);
    const [trackGrid, setGridTrack] = useState(true);

    var mounted = true; //tracking if mounted for cleanup
    var timer; //track timer interval
    //Handlers
    const handleGameOver = data => {
        console.log(data.game);
        dispatch({ type: "GAME_INFO", payload: data });
        let hideDelay = 1000 + (data.game.squares.length * 30);
        setTimeout(() => {
            setGridTrack(false); //stop tracking grid size for clear animation
            if (mounted) dispatch({ type: "CLEAR_SQUARES" });
        }, 1000)
        setTimeout(() => {
            if (mounted) dispatch({ type: "SHOW_END_GAME", payload: data });
        }, hideDelay)
        //dispatch({ type: "GAME_INFO");
        //set leaderbord and run effect to clear squares
    }
    //******** EFFECTS ****************/
    useEffect(() => {
        if (mounted) socket.emit("GET_GAME");

        socket.on("GAME_INFO", data => { if (mounted) dispatch({ type: "GAME_INFO", payload: data }); });
        socket.on("GAME_OVER", data => { if (mounted) handleGameOver(data); });

        socket.on("START_TIMER", _ => { if (mounted) dispatch({ type: "START_TIMER" }); });
        socket.on("CLEAR_TIMER", _ => { if (mounted) dispatch({ type: "END_TIMER" }); });
        socket.on("OUT_OF_TIME", data => {
            if (mounted) {
                dispatch({ type: "OUT_OF_TIME", payload: data });
            }
        });

        return (() => {
            socket.emit("LEAVE_GAME_ROOM", state.game.id);
            socket.removeAllListeners("GAME_INFO");
            socket.removeAllListeners("GAME_TIMER");
            socket.removeAllListeners("GAME_OVER");
            mounted = false;
        })
    }, [])

    useEffect(() => {
        if (state.moveTimer) toggleTimer(true);
        else toggleTimer(false);
    }, [state.moveTimer])

    //use ref or callback here
    useEffect(() => { if (trackGrid) dispatch({ type: "SET_GRID", payload: windowSize }); }, [windowSize, state.game.squares.length, trackGrid])

    //******** Actions ****************/
    const handleClick = id => socket.emit("GAME_CLICK", id);
    const toggleGameLabels = condition => dispatch({ type: "TOGGLE_LABELS", payload: condition });
    const handleQuit = quitting => { if (quitting) socket.emit("QUIT_GAME"); else props.dispatch({ type: 'SWITCH_PAGE', data: 2 }) };

    //******** SQUARE ANIMATIONS ****************/
    const squareAnimations = useTransition(state.game.squares, squareTransitions);
    const flips = useSprings(
        state.game.squares.length,
        state.game.squares.map(flipAnimations)
    )

    //******** ENG GAME ANIMATIONS ****************/
    const gameInfoSpring = useSpring(hideGameInfo(!state.endGameInfo.show));
    const gameOverSpring = useSpring(gameOverTransition(state.endGameInfo.show));
    const hideBoardSpring = useSpring(hideBoardAnimation(!state.endGameInfo.show));


    return (
        <div className="game">
            {/*  GAME BOARD */}
            <a.div
                key={'gameBoard1234'}
                className="game-board"
                style={{
                    ...hideBoardSpring,
                    gridTemplateColumns: `repeat(${state.gridSize[0]}, minmax(20px, 1fr))`,
                    gridTemplateRows: `repeat(${state.gridSize[1]}, minmax(20px, 1fr))`,
                }}>
                {squareAnimations((props, item, _, index) => {
                    const flip = flips[index];
                    const showLabels = state.labels && state.game.status !== "GAME_OVER"
                    return (
                        <a.div
                            style={props}
                            className="squareHolder"
                            key={item.id}>
                            <Square
                                item={item}
                                flipAnimation={flip}
                                handleClick={() => handleClick(item.id)}
                                showLabels={showLabels} />
                        </a.div>)
                })}
            </a.div>
            {/*  GAME OVER */}
            <a.div
                className="gameOverInfo"
                style={gameOverSpring}
                key={'gameOver35423'}
            >
                {state.endGameInfo.show && <GameOver game={state.game} leaderboardInfo={state.endGameInfo} me={props.me} leaveGame={() => props.dispatch({ type: 'SWITCH_PAGE', payload: 2 })} />}
            </a.div>
            {/*  GAME INFO */}
            <a.div
                key={'gameInfo23442'}
                className="gameInfo"
                style={gameInfoSpring}
            >
                <div className='niceBorder' />

                <GameStats
                    me={props.me}
                    status={state.game.status}
                    users={state.game.users}
                    round={state.game.round}
                    message={state.game.message}
                    time={state.moveTimer.time}
                    timerEnabled={state.moveTimer.enabled}
                />
                {/*               <div className='timer'>
                    <label>timer</label>
                    <div className='clock'>
                        <p key='ipohnpio'>{time / 1000}s</p>
                    </div>
                </div> */}

                <CountdownTimer
                    current={time}
                    total={45}
                    size={50}
                    running={state.moveTimer}
                />
                <UserStats
                    users={state.game.users}
                />
                <GameControl
                    toggleGameLabels={toggleGameLabels}
                    handleQuit={() => handleQuit(state.game.id)}
                />
            </a.div>
        </div>)
}

const Square = ({ item, handleClick, showLabels, flipAnimation }) => {
    return (
        <button
            className="square"
            onClick={handleClick}
            disabled={!item.clickable}>
            {showLabels && <label>{item.civ}</label>}
            <a.div className="c back"
                style={flipAnimation ? {
                    opacity: flipAnimation.opacity.to(o => 1 - o),
                    transform: flipAnimation.transform,
                    backgroundImage: `url("${SERVER_URL}/cards/back.jpg")`
                } : {
                    opacity: 1,
                    backgroundImage: `url("${SERVER_URL}/cards/back.jpg")`
                }
                } />
            <a.div className="c front" style={
                flipAnimation ? {
                    opacity: flipAnimation.opacity,
                    transform: flipAnimation.transform.to(t => `${t} rotateX(180deg)`),
                    backgroundImage: `url(${SERVER_URL}${item.image})`
                } : { opacity: 0 }
            } />
        </button>
    )
}