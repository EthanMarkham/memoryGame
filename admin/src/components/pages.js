const Login = require('./login/login').default
const GameList = require('./gameList/index').default
const GameInfo = require('./gameInfo/index').default

const pages = [  //index 0: Login, 1: Games, 2: GameInfo, 3: Users, 4: UserInfo
    ({ state, dispatch, actions }) => (<Login state={state} dispatch={dispatch} actions={actions} />),
    ({ state, dispatch, actions }) => (<GameList state={state} dispatch={dispatch} actions={actions} />),
    ({ state, dispatch, actions }) => (<GameInfo state={state} dispatch={dispatch} actions={actions} />),

]
export default pages