import { getGridLayout } from '../helpers/helpers';

export default function reducer(state, action) { //PAGGES:  0 Loader || 1 GameJoiner || 2 GameCreator || 3 Game || 4 Login || 5 GameOver 
    console.log(action)
    let copy = { ...state }, data
    if (action) data = action.payload
    switch (action.type) {
        case "LOGIN":
            if (!data.error) {
                localStorage.setItem('jwt', data.token)
                copy.auth = { ...data, isAuth: true }  //hook catches auth change and emits listens for socket status
            }
            else {
                localStorage.setItem('jwt', '')
                copy.error = data.message
                copy.pageIndex = 4
            }
            return copy
        case "LOGOUT":
            localStorage.clear()
            copy.game = { id: null, status: "WAITING", squares: [], round: 0, message: '', users: [], showLabels: true, listening: false }
            copy.auth = { username: 'Guest', token: '', isAuth: false }
            copy.pageIndex = 4
            return copy
        case "STATUS":
            if (data.game) {
                copy.game.listening = true
                copy.gameList.listening = false
            }
            else {
                copy.game = { id: null, status: "WAITING", squares: [], round: 0, message: '', users: [], showLabels: true, listening: false }
                copy.pageIndex = 1
                copy.game.listening = false
                copy.gameList.listening = true
            }
            return copy
        case "GAME_INFO":
            copy.gameList.listening = false //stop listening to games
            copy = { ...copy, game: { ...data, showLabels: copy.game.showLabels, listening: copy.game.listening }, users: data.users }
            copy.game.squares = copy.game.squares.map(s => {
                const clickable = (s.image === "/cards/back.PNG" && copy.game.status === "ONGOING" && copy.game.users.find(u => u.upNext).username === copy.auth.username)
                return { ...s, clickable: clickable }
            })
            if (data.status === "GAME_OVER") copy.pageIndex = 5
            else copy.pageIndex = 3
            return copy
        case "QUIT_GAME":
            let game = copy.game
            copy = { ...copy, game: { ...game, status: "QUIT", listening: false } }
            copy.pageIndex = 1
            copy.gameList.listening = true
            return copy
        case "GAME_LIST":
            copy.gameList.games = data
            return copy
        case "GAME_NEW":
            copy.pageIndex = 2
            return copy
        case "GAME_JOIN":
            copy.pageIndex = 1
            copy.gameList.listening = true
            return copy
        case "ERROR":
            copy.error = data
            return copy
        case "TOGGLE_LABELS":
            if (data.type === "GAME") copy.labels.card = (data.value !== undefined) ? data.value : !copy.labels.card;
            else if (data.type === "LEAVE_INFO") copy.labels.leaveInfo = (data.value !== undefined) ? data.value : !copy.labels.leaveInfo
            else if (data.type === "LABEL_INFO") copy.labels.labelInfo = (data.value !== undefined) ? data.value : !copy.labels.labelInfo
            return copy
        case "SET_GRID":
            //checking if we need to return n
            let newGridCalc = getGridLayout(copy.game.squares.length, data)
            console.log(copy.gridSize, newGridCalc)
            if (!newGridCalc) return copy;
            if (newGridCalc[0] === copy.gridSize[0] && newGridCalc[1] === copy.gridSize[1]) return copy; //no change
            copy.gridSize = newGridCalc;
            return copy;
        default:
            return copy;
    }
}
