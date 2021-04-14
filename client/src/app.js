import React, { Suspense, useEffect, useReducer } from "react";
import { useSpring, useTransition, animated as a } from 'react-spring'
import { checkAuth } from './helpers/helpers';
import { initialState } from './helpers/initialState';
import { squareSprings, errorTransition, pageTransition, timerTransition } from './helpers/transitions';
import { SocketContext, socket } from './context/socket';

const reducer = require('./reducers/root').default
const useWindowSize = require('./hooks/useWindowSize').default

const pages = require('./components/pages').default
const Nav = require('./components/nav').default

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
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

  const pageAnimations = useTransition(state.pageIndex, p => p, pageTransition);
  const errorTrans = useTransition(state.error.show, null, errorTransition);
  const timerTrans = useTransition(state.moveTimer, null, timerTransition);
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
  return (<>
    <Suspense fallback={<div>Loading...</div>}>
      <SocketContext.Provider value={socket}>
        <Nav auth={state.auth} dispatch={dispatch} />
        {errorTrans.map(({ item, key, props }) =>
          item
            ? <a.div style={props} key={key} className="errorHolder">
              <b>Error!</b>  <span>{state.error.message}</span>
            </a.div>
            : null)
        }
        <div className="page-container">
          {pageAnimations.map(({ item, props, key }) => {
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
      </SocketContext.Provider>
    </Suspense>
  </>)
}

