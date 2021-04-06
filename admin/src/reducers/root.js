const { initialState } = require('../state/initialState') //might use this
export default function reducer(state, action) { //index 0: Login, 1: Games, 2: GameInfo, 3: Users, 4: USerInfo
    console.log(action)
    let copy = { ...state },
        data
    if (action) data = action.payload
    switch (action.type) {
        case "NEXT_PAGE":
            copy.indexes = {...copy.indexes, ...data}
            return copy;
        case "LOGIN":
            if (!data.error) {
                localStorage.setItem('jwt', data.token)
                copy.auth = { ...data, isAuth: true }
                copy.indexes.page = 1
            } else {
                copy = initialState
                localStorage.setItem('jwt', '')
                copy.error = data.message
            }
            return copy
        case "LOGOUT":
            localStorage.clear()
            copy = initialState
            return copy
        case "GAMES_DATA":
            copy.games = data.games
            if (data.games.length == 0) copy.indexes.page = 1
            return copy;
        case "VIEW_GAME":
            try {
                console.log(data.gameID)
                let gameIndex = copy.games.findIndex(g => g.id === data.gameID)
                copy.indexes.game = gameIndex
                copy.indexes.page = 2
                return copy
            }
            catch (e) {
                copy.error = ({ error: true, ...e })
                return copy
            }
        case "REMOVE_USER":
            console.log(data)
            if (data.deleted) {
                let gameIndex = copy.games.findIndex(g=>g.id === data.gameID);
                let userIndex = copy.games[gameIndex].users.findIndex(u => u.id == data.userID);
                console.log(copy.games)
                copy.games[gameIndex].users[userIndex].active = false;
                return copy;
            }
            else {
                copy.error = {error: true, message: data.message}
            }
        case "DELETE_GAME": 
            if (!data.deleted) copy.error.message = "game is gone?"
            copy.games = data.games
            copy.indexes.page = 1
            return copy;
        default:
            return copy;
    }
}