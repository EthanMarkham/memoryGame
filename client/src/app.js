import React, { useEffect, useReducer } from "react";
import { useSpring, useTransition, animated as a } from 'react-spring'
import { checkAuth } from './helpers/helpers';
import { initialState } from './helpers/initialState';
import { squareSprings, errorTransition, pageTransition } from './helpers/transitions';
const reducer = require('./reducers/root').default
const useWindowSize = require('./hooks/useWindowSize').default

const socket = require("./context/socket").socket;

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
      socket.off("USER_STATUS")
      socket.off("LOGIN_SUCCESS")
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
      console.log('listening')
      socket.emit("GET_GAME") //initial ask for game from server
      socket.on("GAME_INFO", data => dispatch({ type: "GAME_INFO", payload: data }))
    }
    else {
      console.log('not listening')
    }
    return (() => socket.off("GAME_INFO"))
  }, [state.game.listening])

  useEffect(() => {
    if (state.gameList.listening) {
      socket.on("GAME_LIST", data => dispatch({ type: "GAME_LIST", payload: data }))
      socket.emit("LIST_GAMES")
    }
    return (() => socket.off("GAME_LIST"))
  }, [state.gameList.listening])

  useEffect(() => dispatch({ type: "SET_GRID", payload: windowSize }), [windowSize, state.game.squares.length])

  const pageAnimations = useTransition(state.pageIndex, p => p, pageTransition)
  const errorTrans = useTransition(state.error.show, null, errorTransition)
  const actions = {
    handleClick: id => socket.emit("GAME_CLICK", id),
    handleQuit: id => socket.emit("QUIT_GAME", id),
    addGame: data => socket.emit("ADD_GAME", data),
    joinGame: id => socket.emit("ADD_ME_TO_GAME", id)
  }
  return (<>
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
        return <Page
          key={key}
          style={props}
          dispatch={dispatch}
          state={state}
          actions={actions}
        />
      })}
    </div>
  </>)
}

