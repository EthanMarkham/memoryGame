
export const initialState = {
    auth: { 
        username: 'Guest', 
        token: localStorage.getItem('jwt'), 
        isAuth: false,
    },
    error: {
        message: "",
        error: false
    },
    indexes: {
        page: 0, //index 0: Login, 2: Games, 3: GameInfo, 4: Users, 4: USerInfo
        user: 0,
        game: 0
    },
    games: [],
    users: [],
}
