import React, { Suspense, useEffect, useReducer } from "react";
import { useTransition, animated as a } from 'react-spring'
import { checkAuth } from './helpers/helpers';
import { initialState } from './helpers/initialState';
import { errorTransition, pageTransition } from './helpers/transitions';
import { SocketContext, socket } from './context/socket';

const reducer = require('./reducers/root').default
const Loader = require("react-loader-spinner").default

const pages = [
  () => null,
  React.lazy(() => import('./components/login/login')), // 1 - Login
  React.lazy(() => import('./components/pre_game/pre_game')), // 2 - Pre Game
  React.lazy(() => import('./components/game/game')) //3 - Game
]
const Nav = require('./components/nav').default

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  let errorTimeout = null;

  useEffect(() => {
    checkAuth()
      .then(data => (!data.error)
        ? dispatch({ type: "LOGIN", payload: data })
        : dispatch({ type: "SWITCH_PAGE", payload: 1 })) //init check auth, dispatch response which is handled in reducer

    socket.on("ERROR", data => dispatch({ type: "ERROR", payload: data }))
    return (() => socket.removeAllListeners("ERROR"));
  }, [])

  useEffect(() => {
    //when user signs in tell our socket to sign in which triggers it also asking for game info. 
    if (state.auth.isAuth) {
      socket.emit("LOGIN", state.auth.token) //init socket session
      socket.on("LOGIN_SUCCESS", () => socket.emit("GET_STATUS"))
      socket.on("USER_STATUS", status => dispatch({ type: "STATUS", payload: status })) //backend can control where user is by emmitting user status
    }
    else {
      socket.emit("LOGOUT") //tell socket to clear session, mb clean this up with logging out state?
    }
    return () => {
      socket.removeAllListeners("USER_STATUS");
      socket.removeAllListeners("LOGIN_SUCCESS");
    }
  }, [state.auth])

  useEffect(() => {
    if (state.error.show) {
      errorTimeout = setTimeout(() => dispatch({ type: "HIDE_ERROR" }), 2000);
    }
  }, [state.error.show])

  const pageAnimations = useTransition(state.pageIndex, pageTransition);
  const errorTrans = useTransition(state.error.show, errorTransition);
  //const squareSprings = useSprings(state.game.squares.length, items.map(item => ({ opacity: item.opacity })))

  return (<>
    <Nav auth={state.auth} logout={() => dispatch({ type: "LOGOUT" })} />
    <Suspense fallback={<Loader className="loader" type="Rings" color="#00BFFF" height={80} width={80} />}>
      <SocketContext.Provider value={socket}>
        {errorTrans((props, item) =>
          item
            ? <a.div style={props} className="errorHolder">
              <b>Error!</b>  <span>{state.error.message}</span>
            </a.div>
            : null)
        }
        <div className="page-container">
          {pageAnimations((props, item) => {
            const Page = pages[item]
            return (
              <a.div className='animatedDiv' key={'page' + item} style={props}>
                <Page
                  dispatch={dispatch}
                  me={state.auth.username}
                />
              </a.div>)
          })}
        </div>
      </SocketContext.Provider>
    </Suspense>
  </>)
}

