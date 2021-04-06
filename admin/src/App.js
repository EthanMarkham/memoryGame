import React, { useEffect, useReducer } from "react";
import { checkAuth, getGames, removeUser, deleteGame } from './helpers/ajax';
import { initialState } from './state/initialState';
const reducer = require('./reducers/root').default
const pages = require('./components/pages').default
const Nav = require('./components//general/nav').Nav

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  //do i need this?
  const [CurrentPage, NextPage] = useReducer(() => {
    console.log(state.indexes.page)
    return pages[state.indexes.page]
  }, pages[state.indexes.page])

  const actions = {
    getGames: () => getGames().then(data => dispatch({ type: "GAMES_DATA", payload: data })),
    viewGame: gameID => (dispatch({type: "VIEW_GAME", payload: {gameID: gameID}})),
    nextPage: payload => dispatch({type: "NEXT_PAGE", payload: payload}),
    nextTurn: _ => (1),
    removeUser: userID => removeUser(userID).then(data=> dispatch({type: "REMOVE_USER", payload: data})).catch(e => dispatch({type: "ERROR", payload: e})),
    deleteGame: gameID => deleteGame(gameID).then(data=> dispatch({type: "DELETE_GAME", payload: data})).catch(e => dispatch({type: "ERROR", payload: e}))
  }
  useEffect(() => {
    checkAuth().then(data => {
      if (!data.error) dispatch({ type: "LOGIN", payload: data })
    }) //init check auth, dispatch response which is handled in reducer
  }, [])
  //effect calls for aysync data on page switches
  useEffect(() => {
    switch (state.indexes.page) {
      case 0: //index 0: Login, 1: Games, 2: GameInfo, 3: Users, 4: USerInfo
        break;
      case 1:
        getGames().then(data => dispatch({ type: "GAMES_DATA", payload: data }))
        break;
      case 2:
        break;
      case 3:
        break;
      case 4:
        break;
      case 5:
      default:
        break;
    }
    NextPage();
  }, [state.indexes.page])

  /*const actions = {    actions for deleting game, pulling info, all that stuff to be passed as props
    handleClick: id => socket.emit("GAME_CLICK", id),
    handleQuit: id => socket.emit("QUIT_GAME", id),
    addGame: data => socket.emit("ADD_GAME", data),
    joinGame: id => socket.emit("ADD_ME_TO_GAME", id)
  }*/

  //index 0: Login, 1: Games, 2: GameInfo, 3: Users, 4: USerInfo
  return (<>
    <div className="page-container">
      {state.auth.isAuth && <Nav state={state} dispatch={dispatch} actions={actions} />}
      <CurrentPage state={state} dispatch={dispatch} actions={actions} />
    </div>
  </>)
}

