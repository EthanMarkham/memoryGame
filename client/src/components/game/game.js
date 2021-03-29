import React, { useState, useEffect, useCallback, useContext, useReducer } from 'react';
import { useTransition, animated as a } from 'react-spring'
import { SocketContext } from '../../context/socket';
import { getGridLayout } from '../../helpers';

const GameOver = require('./game.over').default
const GameInfo = require('./game.info').default
const useWindowSize = require('../../hooks/useWindowSize').default

function Game(props) {
  const { me, setError, dispatch } = props
  const socket = useContext(SocketContext);
  const size = useWindowSize()
  const [squares, setSquares] = useState([])
  const [labels, setLabels] = useState(true)
  const [users, setUsers] = useState([])
  const [gameID, setGameID] = useState('0')
  const [gameMessage, setGameMessage] = useState("Loading")
  const [round, setRound] = useState(0);
  const [gameOver, setGameOver] = useState(false)

  const handleSquareInfo = useCallback(squares => setSquares(squares), [setSquares])
  const handleGameMessage = useCallback(msg => setGameMessage(msg), [setGameMessage])
  const handleUserInfo = useCallback(users => setUsers(users), [setUsers])
  const handleRoundInfo = useCallback(round => setRound(round), [setRound])
  const handleGameID = useCallback(id => setGameID(id), [setGameID])
  const toggleLables = useCallback(() => setLabels(!labels), [labels])

  const handleGameData = (data, gameOver) => {
    handleSquareInfo(data.squares)
    handleGameMessage(data.message)
    handleUserInfo(data.users)
    handleRoundInfo(data.round)
    handleGameID(data.id)
    if (gameOver) setGameOver(true)
  }
  const getTurn = () => ((users.length > 0) ? users.find(u => u.upNext).username : "Waiting")
  const handleClick = id => socket.emit("GAME_CLICK", id)
  const handleQuit = () => { socket.emit("QUIT_GAME", gameID); dispatch({type: "GAME_JOIN"}); }
  const cantClick = (id) => {
    let i = squares.findIndex(sq => sq.id == id);
    let turn = getTurn()
    if (squares.filter(s => s.flipped).length >= 2 || squares[i].image !== "/cards/back.PNG") return true
    else if (turn !== me) return true
    else return false
  }

  const [gridSize, dispatchGridSize] = useReducer(() => {
    return getGridLayout(squares.length, size)
  }, [size, squares.length])

  useEffect(() => {
    socket.emit("GET_GAME")

    socket.on("GAME_INFO", data => handleGameData(data))
    socket.on("GAME_ERROR", data => setError(data))
    socket.on("GAME_OVER", data => handleGameData(data, true))
    return () => {
      socket.off("GAME_INFO", data => handleGameData(data))
      socket.off("GAME_ERROR", data => setError(data))
      socket.off("GAME_OVER", data => handleGameData(data, true))
    }
  }, []);

  useEffect(() => {
    dispatchGridSize()
  }, [size, squares.length])

  const springs = useTransition(squares, item => item.id, {
    //from: { opacity: 0},
    to: { opacity: 1 },
    from: { opacity: 0 },
    enter: { transform: `perspective(600px) rotateX(0deg)`, opacity: 1 },
    initial: { transform: `perspective(600px) rotateX(0deg)`, opacity: 0 },
    update: { transform: `perspective(600px) rotateX(0px)`, opacity: 1 },
    //unique: true,
    trail: 50
  })
  if (!gameOver) return (
    <div className='gameContainer'>
      <div className="game-board" style={{ gridTemplateColumns: `repeat(${gridSize[0]}, minmax(20px, 1fr))`, gridTemplateRows: `repeat(${gridSize[1]}, minmax(20px, 1fr))` }}>
        {springs.map(({ item, props, key }) => (
          <a.div
            style={{ ...props }}
            key={key}
            className="squareHolder">
            <button
              className="square"
              onClick={() => handleClick(item.id)}
              style={{ backgroundImage: `url(http://localhost:5000/${item.image})` }}//;fix show labels
              disabled={cantClick(item.id)}>
              {labels && <label>{item.civ}</label>}
            </button>
          </a.div>
        )
        )}
      </div>
      <GameInfo
        me={me}
        users={users}
        message={gameMessage}
        setLabels={toggleLables}
        turn={() => (getTurn())}
        round={round}
        handleQuit={handleQuit}
      />
    </div>
  )
  else return (<GameOver me={me} dispatch={dispatch} message={gameMessage} round={round} users={users} />)
}


export default Game;