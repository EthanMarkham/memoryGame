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
            copy.auth = {username: 'Guest', token: '', isAuth: false }
            copy.pageIndex = 4
            return copy
        case "STATUS":
            if (data.game) {
                copy.game.listening = true
                copy.gameList.listening = false
            }
            else {
                copy.pageIndex = 2
                copy.gameList.listening = true
            }
            return copy
        case "TOGGLE_LABELS":
            copy.game.showLabels = !copy.game.showLabels
            return copy
        case "GAME_INFO":
            copy.gameList.listening = false //stop listening to games
            copy = { ...copy, game: { ...data } }
            console.log(copy)
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
            copy.gameList.games = { ...data }
            return copy

        case "GAME_NEW":
            copy.pageIndex = 2
            return copy

        case "GAME_JOIN":
            copy.pageIndex = 1
            copy.gameList.listening = true
            return copy
        case "ERROR":
            copy.error = data.message
            return copy
        default:
            copy.pageIndex = 0
            return copy
    }
}
