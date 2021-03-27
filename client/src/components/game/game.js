import React, { useState, useEffect, useCallback, useContext, useReducer } from 'react';
import { propTypes } from 'react-bootstrap/esm/Image';
import { SocketContext } from '../../context/socket';
import { getGridLayout } from '../../helpers';
import { Transition, animated as a } from 'react-spring/renderprops'

const GameInfo = require('./game.info').default
const useWindowSize = require('../../hooks/useWindowSize').default

function Game(props) {
  const socket = useContext(SocketContext);
  const size = useWindowSize()
  const [squares, setSquares] = useState([])
  const [labels, setLabels] = useState(true)
  const [users, setUsers] = useState([])
  const [gameID, setGameID] = useState('0')
  const [gameMessage, setGameMessage] = useState("Loading")
  const [round, setRound] = useState(0);
  const [error, setError] = useState("")

  const handleSquareInfo = useCallback(squares => setSquares(squares), [setSquares])
  const handleGameMessage = useCallback(msg => setGameMessage(msg), [setGameMessage])
  const handleUserInfo = useCallback(users => setUsers(users), [setUsers])
  const handleRoundInfo = useCallback(round => setRound(round), [setRound])
  const handleGameID = useCallback(id => setGameID(id), [setGameID])
  const toggleLables = useCallback(() => setLabels(!labels), [labels])

  const getTurn = useCallback(() => users.find(u => u.upNext).username, [users])
  const cardsShowing = useCallback(() => squares.filter(s => s.flipped).length, [squares])
  const handleClick = id => socket.emit("GAME_CLICK", id)
  const handleQuit = () => { props.setGameState("GAME_JOIN"); socket.emit("QUIT_GAME", gameID) }
  const cantClick = (id) => {let i = squares.findIndex(sq => sq.id === id); return (cardsShowing() >= 2 && getTurn() !== props.me && squares[i].value !== "*")}

  const [gridSize, dispatchGridSize] = useReducer(() => {
    return getGridLayout(squares.length, size)
  }, size)

  useEffect(() => {
    socket.emit("GET_GAME")
    socket.on("GAME_INFO", data => {handleSquareInfo(data.squares);handleGameMessage(data.message);handleUserInfo(data.users);handleRoundInfo(data.round);handleGameID(data.id)})
    socket.on("GAME_ERROR", data => setError(data))

    return () => {
      socket.off("GAME_INFO", data => {handleSquareInfo(data.squares);handleGameMessage(data.message);handleUserInfo(data.users);handleRoundInfo(data.round);handleGameID(data.id)})
      socket.off("GAME_ERROR", data => setError(data))
    }
  }, []);

  useEffect(() => {
    dispatchGridSize()
  }, [size, squares.length])

  return (
    <div className='gameContainer'>
      <div className="game-board" style={{ gridTemplateColumns: `repeat(${gridSize[0]}, minmax(20px, 1fr))`, gridTemplateRows: `repeat(${gridSize[1]}, minmax(20px, 1fr))` }}>
        <Transition
          items={squares} keys={item => item.id}
          initial={{ opacity: 0 }} //height: '0px'
          enter={{ opacity: 1 }} //height: '100%'
          leave={{ opacity: 0 }}
          update={{}}
          trail={25}
        >
          {item => animated => <Square
            {...item}
            handleClick={handleClick}
            clickable={() => {cantClick(item.id)}}
            style={animated}
            showLabels={labels}
          />}
        </Transition>
      </div>
      <GameInfo
        me={props.me}
        users={users}
        message={gameMessage}
        setLabels={toggleLables}
        turn={() => (getTurn())}
        round={round}
        handleQuit={handleQuit}
      />
    </div>
  );
}

const Square = (poops) => {
  return (
    <button
      className="square"
      onClick={() => poops.handleClick(poops.id)}
      style={{ ...poops.style }}//;
      disabled={!poops.clickable}
    >
      <img
        src={`http://localhost:5000/${poops.image}`}
        alt={poops.civ}
      />
      {poops.showLabels && <label>{poops.civ}</label>}
    </button>
  );
}
export default Game;