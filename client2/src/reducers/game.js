import { getGridLayout } from '../helpers/helpers';

export default function gameReducer(state, action) { //PAGGES:  0 Loader || 1 GameJoiner || 2 GameCreator || 3 Game || 4 Login || 5 GameOver 
    let copy = { ...state }, data;
    if (action) data = action.payload;
    switch (action.type) {
        case "GAME_INFO":
            console.log(data)
            copy = setGameInfo(copy, state, data)
            if (copy.moveTimer != data.game.timerEnabled) copy.moveTimer = data.game.timerEnabled; //if timer enabled and ours is not start timer
            return copy

        case "SHOW_END_GAME":
            copy.endGameInfo = { ...data.leaderboard, show: true };
            return copy;

        case "CLEAR_SQUARES":
            copy.game.squares = [];
            return copy;

        case "TOGGLE_LABELS":
            copy.labels = (data !== undefined) ? data : !copy.labels;
            return copy

        case "SET_GRID":
            //checking if we need to return n
            let newGridCalc = getGridLayout(copy.game.squares.length, data)
            if (!newGridCalc) return copy;
            if (newGridCalc[0] === copy.gridSize[0] && newGridCalc[1] === copy.gridSize[1]) return copy; //no change
            copy.gridSize = newGridCalc;
            return copy;
        //seperate timer dispatcher??
        case "START_TIMER":
            copy.moveTimer = true;
            return copy;
        case "END_TIMER":
            copy.moveTimer = false;
            return copy;
        default:
            return copy;
    }
}
function setGameInfo(copy, state, { game }) {
    copy = { ...copy, game: game };
    copy.game.squares = game.squares.map(s => {
        const clickable = (s.image === "/cards/back.jpg" && copy.game.status === "ONGOING" && copy.game.users.find(u => u.upNext).username === copy.me);
        if (state.game.squares.length === 0 && copy.game.squares.length > 0) return { ...s, clickable: clickable, newSquare: true };
        return { ...s, clickable: clickable };
    })
    return copy;
}