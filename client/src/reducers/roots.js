const { login, checkAuth } = require('../helpers')

const initialState = {
    auth: { user: 'Guest', token: localStorage.getItem('jwt'), isAuth: false },
    pageIndex: 0, //index 0: Loader, 1: Join, 2: New, 3: Game, 4: Login
    game: {
        id: null,
        squares: [],
        round: 0,
        message: '',
        users: [],
        showLabels: true,
    },
    joinableGames: [],
    error: ''
}
export default function reducer(state = initialState, action, socket) { //index 0: Loader, 1: Join, 2: New, 3: Game, 4: Login
    console.log(action)
    let copy = { ...state }
    switch (action.type) {
        case LOGIN:
            login(action.payload)
                .then(data => {
                    localStorage.setItem('jwt', data.token)
                    copy.user = { ...data, isAuth: true }
                    socket.login().then(() => {
                        copy.pageIndex = 1
                        return copy
                    }).catch(err => {
                        copy.error = err
                        return copy
                    })
                })
                .catch(err => {
                    copy.error == err.message
                    return copy
                })
        case CHECKAUTH:
            if (localStorage.getItem('jwt')) {
                checkAuth().then(data => {
                    copy.user = { ...data, isAuth: true }
                    socket.checkStatus.then(() => {
                        copy.pageIndex = 3 //if in game 
                        return copy
                    }).catch(() => {
                        copy.pageIndex = 2 //if no game
                        return copy
                    }) 
                }).catch(() => {
                    copy.pageIndex = 4
                    return copy
                })
            }
            else {
                copy.pageIndex = 4
                return copy
            }
        case GETSTATUS:

    }

    if (action.type === "LOGIN") socket.emit('LOGIN', localStorage.getItem('jwt'))
    else if (action.type == "LOGOUT") {
        socket.emit("LOGOUT")
        setAuth(false)
        nextAction = 4
    }
    else if (action.type === "ADD_GAME") {
        console.log(action)
        socket.emit("ADD_GAME", JSON.stringify(action.payload))
    }
    else if (action.type === "LOGIN_PAGE") nextAction = 4
    else if (action.type === "GAME_JOIN") nextAction = (auth.isAuth) ? 1 : 5
    else if (action.type === "GAME_NEW") nextAction = (auth.isAuth) ? 2 : 5
    else if (action.type === "GAME_NEW") nextAction = (auth.isAuth) ? 3 : 5
    else nextAction = 0

    console.log(nextAction)
    return nextAction
}