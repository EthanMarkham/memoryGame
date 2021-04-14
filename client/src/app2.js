import React, { Suspense, useEffect, useReducer } from "react";
import { useSpring, useTransition, animated as a } from 'react-spring'
import { checkAuth } from './helpers/helpers';
import { initialState } from './helpers/initialState';
import { squareSprings, errorTransition, pageTransition, timerTransition } from './helpers/transitions';
import { SocketContext, socket } from './context/socket';

const reducer = require('./reducers/root').default

const pages = {
  Loader: require("react-loader-spinner").default,
  Login: React.lazy(() => import('./components/login/login')),
  PreGame: React.lazy(() => import('./components/pre_game/pre_game')),
  Login: React.lazy(() => import('./components/game/game')),
}
const Nav = require('./components/nav').default

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
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
    //when user signs in tell our socket to sign in which triggers it also asking for game info. 
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

  const pageAnimations = useTransition(state.pageIndex, p => p, pageTransition);
  const errorTrans = useTransition(state.error.show, null, errorTransition);
  //const squareSprings = useSprings(state.game.squares.length, items.map(item => ({ opacity: item.opacity })))

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
                  me={state.auth.username}
                />
              </a.div>)
          })}
        </div>
      </SocketContext.Provider>
    </Suspense>
  </>)
}

