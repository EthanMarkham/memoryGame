import { getGridLayout } from '../helpers/helpers';

export default function gameReducer(state, action) { //PAGGES:  0 Loader || 1 GameJoiner || 2 GameCreator || 3 Game || 4 Login || 5 GameOver 
    console.log(action)
    let copy = { ...state }, data
    if (action) data = action.payload
    switch (action.type) {
        case "GAME_INFO":
            copy = setGameInfo(copy, state, data)
            return copy
        case "GAME_TIMER":
            copy.moveTimer = parseInt(data);
            return copy;

        case "TOGGLE_LABELS":
            if (data.type === "GAME_INFO") copy.labels.card = (data.value !== undefined) ? data.value : !copy.labels.leaveInfo;
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
        default:
            return copy;
    }
}
function setGameInfo(copy, state, { game }) {
    copy = { ...copy, game: { ...game, listening: copy.game.listening } }
    copy.game.squares = copy.game.squares.map((s, index) => {
        const clickable = (s.image === "/cards/back.PNG" && copy.game.status === "ONGOING" && copy.game.users.find(u => u.upNext).username === copy.me)
        if (state.game.squares.length === 0 && copy.game.squares.length > 0) return { ...s, clickable: clickable, newSquare: true }
        let flipping = (state.game.squares.length > 0 && state.game.squares[index].image !== s.image) ? true : false; //adding these values for animations
        if (flipping) return { ...s, clickable: clickable, flipping: flipping }
        else return { ...s, clickable: clickable }
    })
    if (game.status === "GAME_OVER") copy.pageIndex = 5
    else copy.pageIndex = 3
    return copy
}