
export const initialState = {
    auth: { 
        username: 'Guest', 
        token: localStorage.getItem('jwt'), 
        isAuth: false 
    },
    pageIndex: 0, //index 0: Loader, 1: Join, 2: New, 3: Game, 4: Login
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
    gameList: { 
        games: [], 
        listening: false 
    },
    moveTimer: 45,
    error: {
        show: false,
        message: '',
    },
    labels: {
        card: true,
        leaveInfo: false,
        labelInfo: false
    }
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
    moveTimer: 45,
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