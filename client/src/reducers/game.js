import { getGridLayout } from '../helpers/helpers';

export default function gameReducer(state, action) { //PAGGES:  0 Loader || 1 GameJoiner || 2 GameCreator || 3 Game || 4 Login || 5 GameOver 
    let copy = { ...state }, data
    if (action) data = action.payload
    switch (action.type) {
        case "GAME_INFO":
            copy = setGameInfo(copy, state, data)
            if (data.game.users.length === 1) copy.moveTimer.enabled = false;
            return copy
        case "GAME_TIMER":
            copy.moveTimer = {time: parseInt(data), enabled: true};
            return copy;

        case "TOGGLE_LABELS":
            if (data.type === "GAME_INFO") copy.labels.card = (data.value !== undefined) ? data.value : !copy.labels.leaveInfo;
            else if (data.type === "LEAVE_INFO") copy.labels.leaveInfo = (data.value !== undefined) ? data.value : !copy.labels.leaveInfo;
            else if (data.type === "LABEL_INFO") copy.labels.labelInfo = (data.value !== undefined) ? data.value : !copy.labels.labelInfo;
            return copy

        case "SET_GRID":
            //checking if we need to return n
            let newGridCalc = getGridLayout(copy.game.squares.length, data)
            if (!newGridCalc) return copy;
            if (newGridCalc[0] === copy.gridSize[0] && newGridCalc[1] === copy.gridSize[1]) return copy; //no change
            copy.gridSize = newGridCalc;
            return copy;
        default:
            return copy;
    }
}
function setGameInfo(copy, state, {game}) {
    copy = { ...copy, game: game};
    copy.game.squares = game.squares.map(s => {
        const clickable = (s.image === "/cards/back.PNG" && copy.game.status === "ONGOING" && copy.game.users.find(u => u.upNext).username === copy.me);
        if (state.game.squares.length === 0 && copy.game.squares.length > 0) return { ...s, clickable: clickable, newSquare: true };
        return { ...s, clickable: clickable };
    })
    return copy;
}