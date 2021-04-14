import React, { useEffect, useReducer } from "react";
import ReactDOM from 'react-dom';
import { useSpring, useTransition, animated as a } from 'react-spring'
import { checkAuth } from './helpers/helpers';
import { initialState } from './helpers/initialState';
import { squareSprings, errorTransition, pageTransition, timerTransition } from './helpers/transitions';
import socketio from "socket.io-client";
import GameInfo from './components/game/game.info.jsx';
import GameBoard from './components/game/game.board.jsx';
import Login from './components/pages/login.jsx';
import GameJoiner from './components/pages/game.join.jsx';
import GameCreator from './components/pages/game.new.jsx';
import GameOver from './components/pages/game.over.jsx';
import Nav from './components/nav.jsx';
import Loader from "react-loader-spinner";
import reducer from './reducers/root';
import useWindowSize from './hooks/useWindowSize';


export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const socket = socketio.connect("/", { reconnectionDelayMax: 10000 });
  // const [hoverStyle, setHoverStyle] = useSpring(() => ({ xys: [0, 0, 1], config: { mass: 5, tension: 350, friction: 40 } }))
  const windowSize = useWindowSize()
  var errorTimeout
  useEffect(() => {
    checkAuth().then(data => {
      if (data.error) dispatch({ type: "SWITCH_PAGE", payload: { pageIndex: 4 } })
      else dispatch({ type: "LOGIN", payload: data })
    }) //init check auth, dispatch response which is handled in reducer

    socket.on("ERROR", data => dispatch({ type: "ERROR", payload: data }))
    return (() => socket.off("ERROR"))
  }, [])

  useEffect(() => {
    if (state.auth.isAuth) {
      console.log('asking loggin socket')
      socket.emit("LOGIN", localStorage.getItem('jwt')) //init socket session
      socket.on("LOGIN_SUCCESS", () => socket.emit("GET_STATUS"))
      socket.on("USER_STATUS", status => dispatch({ type: "STATUS", payload: status })) //backend can control where user is by emmitting user status
    }
    else {
      socket.emit("LOGOUT") //tell socket to clear session, mb clean this up with logging out state?
    }
    return () => {
      socket.off("USER_STATUS", status => dispatch({ type: "STATUS", payload: status }))
      socket.off("LOGIN_SUCCESS", () => socket.emit("GET_STATUS"))
    }
  }, [state.auth])

  useEffect(() => {
    if (state.error.show) {
      clearTimeout(errorTimeout);
      errorTimeout = setTimeout(() => {
        dispatch({ type: "HIDE_ERROR" });
      }, 2000)
    }
  }, [state.error.show])
  useEffect(() => {
    if (state.game.listening) {
      console.log('listening');
      socket.emit("JOIN_GAME_LIST");
      socket.on("GAME_INFO", data => dispatch({ type: "GAME_INFO", payload: data }));
      socket.on("GAME_TIMER", time => dispatch({ type: "GAME_TIMER", payload: time }));
    }
    else {
      console.log('not listening')
    }
    return (() => {
      socket.off("GAME_INFO", data => dispatch({ type: "GAME_INFO", payload: data }));
      socket.off("GAME_TIMER", time => dispatch({ type: "GAME_TIMER", payload: time }));
    })
  }, [state.game.listening])

  useEffect(() => {
    if (state.gameList.listening) {
      socket.on("GAME_LIST", data => dispatch({ type: "GAME_LIST", payload: data }))
    }
    else {
      socket.emit("LEAVE_GAME_LIST");
    }
    return (() => {
      socket.off("GAME_LIST", data => dispatch({ type: "GAME_LIST", payload: data }))
    })
  }, [state.gameList.listening])

  useEffect(() => dispatch({ type: "SET_GRID", payload: windowSize }), [windowSize, state.game.squares.length])

  const pageAnimations = useTransition(state.pageIndex, pageTransition);
  const errorTrans = useTransition(state.error.show, errorTransition);
  const timerTrans = useTransition(state.moveTimer, timerTransition);
  //const squareSprings = useSprings(state.game.squares.length, items.map(item => ({ opacity: item.opacity })))

  const transitions = {
    timerTrans: timerTrans,
  }
  const actions = {
    handleClick: id => socket.emit("GAME_CLICK", id),
    handleQuit: id => socket.emit("QUIT_GAME", id),
    addGame: data => socket.emit("ADD_GAME", data),
    joinGame: id => socket.emit("JOIN_GAME", id)
  }

  const pages = [
    () => <Loader className="loader" type="Rings" color="#00BFFF" height={80} width={80} />,

    ({ dispatch, state, actions }) => <GameJoiner
      dispatch={dispatch}
      games={state.gameList.games}
      joinGame={actions.joinGame} />,

    ({ dispatch, actions }) => <GameCreator
      dispatch={dispatch}
      addGame={actions.addGame} />,

    ({ dispatch, state, actions }) => <>
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
    </>,

    ({ dispatch}) => <Login dispatch={dispatch} />,

    ({dispatch, state}) =><GameOver state={state} dispatch={dispatch} />,
  ]


  return (<>
    <Nav auth={state.auth} dispatch={dispatch} />
    {errorTrans((props, item, key) =>
      item
        ? <a.div style={props} key={key} className="errorHolder">
          <b>Error!</b>  <span>{state.error.message}</span>
        </a.div>
        : null)
    }
    <div className="page-container">
      {pageAnimations((props, item, key) =>{
        const Page = pages[item]
        return (
          <a.div className='animatedDiv' style={{ ...props }}>
            <Page
              key={key}
              dispatch={dispatch}
              state={state}
              actions={actions}
              transitions={transitions}
            />
          </a.div>)
      })}
    </div>
  </>)
}

ReactDOM.render(<App/>, document.getElementById('root'));