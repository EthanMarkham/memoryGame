import Cookies from 'universal-cookie';

//0 loader, 1 login, 2 pregame, 3 GAme
export default function reducer(state, action) {
    const cookies = new Cookies();
    let copy = { ...state }, data
    if (action) data = action.payload
    switch (action.type) {
        case "LOGIN":
            if (!data.error) {
                cookies.set('userToken', data.token, {path: '/'})
                console.log(cookies.get('userToken')); // Pacman
                //localStorage.setItem('jwt', data.token)
                copy.auth = { ...data, isAuth: true }  //hook catches auth change and emits listens for socket status
            }
            else {
                //localStorage.setItem('jwt', '')
                cookies.remove('userToken') //remove token if error with login
                copy.error.message = data.message
                copy.error.show = true;
                copy.pageIndex = 1
            }
            return copy
        case "LOGOUT":
            localStorage.clear()
            cookies.remove('userToken');
            copy.auth = { username: 'Guest', token: '', isAuth: false }
            copy.pageIndex = 1
            return copy
        case "STATUS":
            if (data.game) copy.pageIndex = 3;
            else copy.pageIndex = 2;
            return copy
        case "SWITCH_PAGE":
            console.log('switch to page ' + data);
            copy.pageIndex = data;
            return copy
        case "ERROR":
            copy.error.message = data
            copy.error.show = true
            if (data === "User not in game") { //this is to force them out of game if admin kicks them. probably a better way
                copy.error.message = "You were removed from game"
                copy.error.show = true
                copy.pageIndex = 2;
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
