import { getGridLayout } from '../helpers/helpers';

export default function reducer(state, action) { //PAGGES:  0 Loader || 1 LOGIN || 2 PREGAME || 3 Game
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
                copy.pageIndex = 1
            }
            return copy
        case "LOGOUT":
            localStorage.clear()
            copy.auth = { username: 'Guest', token: '', isAuth: false }
            copy.pageIndex = 1
            return copy
        case "STATUS":
            if (data.game) copy.pageIndex = 3;
            else copy.pageIndex = 2;
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
       
        case "HIDE_ERROR":
            copy.error.show = false;
            return copy;
       
        default:
            return copy;
    }
}
