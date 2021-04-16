
export const initialState = {
    auth: { 
        username: 'Guest', 
        token: localStorage.getItem('jwt'), 
        isAuth: false 
    },
    pageIndex: 0, 
    error: {
        show: false,
        message: '',
    },
}

export const gameState = {
    gridSize: [0, 0],
    game: {
        id: null,
        status: "WAITING",
        squares: [],
        round: 0,
        message: '',
        users: [],
        listening: false
    },
    moveTimer: {
        time: 45,
        enabled: false
    },
    labels: {
        card: true,
        leaveInfo: false,
        labelInfo: false
    }
}
export const preGameState = {
    gameList: { 
        games: [], 
    },
    newGame: {
        gameName: "",
        playerCount: 1,
        cardCount: 48
    },
    action: 0, //0 joining ---- OR ---- 1 creating
}