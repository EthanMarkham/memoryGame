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
                copy.error.message = data.message
                copy.error.show = true;
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
                copy = setGameInfo(copy, state, data)
            }
            else {
                copy.game = { id: null, status: "WAITING", squares: [], round: 0, message: '', users: [], showLabels: true, listening: false }
                copy.pageIndex = 1
                copy.game.listening = false
                copy.gameList = { games: data.openGames, listening: true }
            }
            return copy
        case "GAME_INFO":
            copy = setGameInfo(copy, state, data)
            return copy
        case "GAME_TIMER":
            copy.moveTimer = parseInt(data);
            return copy;
        case "QUIT_GAME":
            let game = copy.game
            copy = { ...copy, game: { ...game, status: "QUIT", listening: false } }
            copy.pageIndex = 1
            copy.gameList.listening = true
            return copy
        case "GAME_LIST":
            copy.gameList.games = data
            return copy

        case "ERROR":
            copy.error.message = data
            copy.error.show = true
            if (data === "User not in game") { //this is to force them out of game if admin kicks them. probably a better way
                let game = copy.game
                copy.error.message = "You were removed from game"
                copy.error.show = true
                copy = { ...copy, game: { ...game, status: "QUIT", listening: false } }
                copy.pageIndex = 1
                copy.gameList.listening = true
                return copy
            }
            return copy
        case "TOGGLE_LABELS":
            if (data.type === "GAME_INFO") {
                copy.labels.card = !copy.labels.card;
                console.log(copy.labels)
                return copy
            }
            //ON HOVER BLOWING OUT DISPATCHER AND MOVED BACK TO SUB COMPONENT
            else if (data.type === "LEAVE_INFO") copy.labels.leaveInfo = (data.value !== undefined) ? data.value : !copy.labels.leaveInfo;
            else if (data.type === "LABEL_INFO") copy.labels.labelInfo = (data.value !== undefined) ? data.value : !copy.labels.labelInfo;
            return copy
        case "SET_GRID":
            //checking if we need to return n
            let newGridCalc = getGridLayout(copy.game.squares.length, data)
            console.log(copy.gridSize, newGridCalc)
            if (!newGridCalc) return copy;
            if (newGridCalc[0] === copy.gridSize[0] && newGridCalc[1] === copy.gridSize[1]) return copy; //no change
            copy.gridSize = newGridCalc;
            return copy;
        case "HIDE_ERROR":
            copy.error.show = false;
            return copy;
        case "SWITCH_PAGE":
            copy.pageIndex = data.pageIndex
            return copy;
        default:
            return copy;
    }
}
function setGameInfo(copy, state, { game }) {
    copy = { ...copy, game: { ...game, listening: copy.game.listening } }
    copy.game.squares = copy.game.squares.map((s, index) => {
        const clickable = (s.image === "/cards/back.PNG" && copy.game.status === "ONGOING" && copy.game.users.find(u => u.upNext).username === copy.auth.username)
        if (state.game.squares.length === 0 && copy.game.squares.length > 0) return { ...s, clickable: clickable, newSquare: true }
        let flipping = (state.game.squares.length > 0 && state.game.squares[index].image !== s.image) ? true : false; //adding these values for animations
        if (flipping) return { ...s, clickable: clickable, flipping: flipping }
        else return { ...s, clickable: clickable }
    })
    if (game.status === "GAME_OVER") copy.pageIndex = 5
    else copy.pageIndex = 3
    return copy
}