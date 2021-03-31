const Game = require("../model/game.model").Game;
var GameManager = module.exports = {
    games: [],
    GameCount: _ => (GameManager.games.count),
    GetOpenGameInfo: _ => {
        let gameList = GameManager.games.filter(g => !g.users.length < g.playerCount)
        return gameList.map(g => ({
            players: g.users.length,
            maxPlayers: g.playerCount,
            id: g.id,
            name: g.name
        }))
    },
    FindIndexByUserID: userID => (GameManager.games.filter(g => g.status === "ONGOING").findIndex(g => g.users.filter(u => u.active).map(u => u.id).includes(userID))),
    FindIndexByGameID: gameID => (GameManager.games.findIndex(g => g.id == gameID)),
    GetClientInfo: userID => {
        return new Promise((res, rej) => {
            let gameIndex = GameManager.FindIndexByUserID(userID)
            if (gameIndex == -1) rej("User not in game")
            res(GameManager.games[gameIndex].ClientInfo())
        })
    },
    NewGame: (user, playerCount, size, gameName) => {
        let filter = require('leo-profanity')
        filter.loadDictionary()
        gameName = filter.clean(gameName)

        return new Promise((res, rej) => {
            if (GameManager.FindIndexByUserID(user.id) != -1) rej("User already in a game!")
            let newGame = new Game(user, playerCount, size, gameName)
            GameManager.games.push(newGame)
            res(newGame)
        })
    },
    AddUser: (user, gameID) => {
        return new Promise((res, rej) => {
            let gameIndex = GameManager.FindIndexByGameID(gameID)
            if (gameIndex == -1) rej("Game not found")
            GameManager.games[gameIndex].AddUser(user)
            res(GameManager.games[gameIndex].ClientInfo()) //send game info after added
        })
    },
    RemoveUser: userID => {
        return new Promise((res, rej) => {
            let gameIndex = GameManager.FindIndexByUserID(userID)
            if (!gameIndex) rej("Game not found")
            GameManager.games[gameIndex].RemoveUser(user)
            if (GameManager.games[gameIndex].users.filter(u => u.active) === 0) {//deleting games if no users
                GameManager.games.splice(gameIndex, 1)
                res({ id: id, deleted: true }) //why do i pass if it was deleted?
            }
            else if (GameManager.games[gameIndex].inProgress && !GameManager.games[gameIndex].UpNext()) GameManager.games[gameIndex].NextTurn() //if no one is up next and game ongoing skip next turn
            res({ id: id, delted: false })
        })
    },
    HandleClick: (userID, guess) => {
        return new Promise((res, rej) => {
            let gameIndex = GameManager.FindIndexByUserID(userID)
            if (gameIndex == -1) rej("User not in game")
            GameManager.games[gameIndex].HandleClick(userID, guess) //handle click will validate they can click and throw errors if not
            res(GameManager.games[gameIndex]) //we send entire game info to check game conditions and broadcast different for gameover/reset
        })
    },
    ResetCards: gameID => {
        return new Promise((res, rej) => {
            let gameIndex = GameManager.FindIndexByGameID(gameID)
            if (gameIndex == -1) rej("Game not found?")
            setTimeout(() => {
                GameManager.games[gameIndex].ResetCards()
                res(GameManager.games[gameIndex].ClientInfo())
            }, 3000)
        })
    },
}

