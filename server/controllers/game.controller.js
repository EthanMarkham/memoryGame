const Game = require("../model/game.model").Game;
const User = require("../model/user.model");

var GameManager = module.exports = {
    games: [],
    GameCount: _ => (GameManager.games.count),
    GetAllGames: _ => GameManager.games,
    GetOpenGameInfo: _ => {
        let gameList = GameManager.games.filter(g => g.users.length < g.playerCount)
        return gameList.map(g => ({
            players: g.users.length,
            maxPlayers: g.playerCount,
            id: g.id,
            name: g.name
        }))
    },
    FindIndexByUserID: userID => {
        try {
            let gameSearch = GameManager.games.filter(g => g.status != "GAME_OVER").map(g => ({ id: g.id, users: g.users.filter(u => u.active).map(u=>u.id) }));
            let tempIndex = gameSearch.findIndex(g => g.users.includes(userID));
            console.log(tempIndex, gameSearch)
            return (GameManager.FindIndexByGameID(gameSearch[tempIndex].id))
        }
        catch { return -1 }
    },
    FindIndexByGameID: gameID => GameManager.games.findIndex(g => g.id == gameID),
    GetClientInfo: userID => {
        return new Promise((res, rej) => {
            if (!userID) reject("No credentials")
            let gameIndex = GameManager.FindIndexByUserID(userID)
            if (gameIndex == -1) rej("User not in game")
            res(GameManager.games[gameIndex].ClientInfo())
        })
    },
    NewGame: (userID, info) => {
        return new Promise(async (res, rej) => {
            try {
                let user = await User.findById(userID)
                if (!user) rej({ error: true, message: "No credentials" })
                if (GameManager.FindIndexByUserID(userID) != -1) rej({ error: true, message: "User already in a game!" })
                let filter = require('leo-profanity')
                filter.loadDictionary()
                gameName = filter.clean(info.name)
                let newGame = Game(user, info.playerCount, info.cardCount, gameName)
                GameManager.games.push(newGame)
                res(newGame)
            } catch (err) { rej(err) }
        })
    },
    DeleteGame: (gameID) => {
        try {
            let gameIndex = GameManager.FindIndexByGameID(gameID)
            GameManager.games.splice(gameIndex, 1)
            return { deleted: true }
        }
        catch {
            return { deleted: false, games: this.games } //return games to reload if error?
        }
    },
    AddUser: (userID, gameID) => {
        return new Promise((res, rej) => {
            let gameIndex = GameManager.FindIndexByGameID(gameID) //if we search by user itll ignore because user no longer in game
            if (gameIndex == -1) rej({ error: true, message: "Game not found" })
            try {
                User.findById(userID)
                    .then(user => {
                        GameManager.games[gameIndex].AddUser(user)
                        res(GameManager.games[gameIndex])  //send game info after added)
                    }).catch(err => rej(err))
            } catch (err) { rej(err) }
        })
    },
    RemoveUser: userID => {
        return new Promise((res, rej) => {
            try {
                let gameIndex = GameManager.FindIndexByUserID(userID)
                if (gameIndex == -1) rej({ error: true, message: "Game not found" })
                response = GameManager.games[gameIndex].RemoveUser(userID)
                if (response.deleted) {
                    let id = GameManager.games[gameIndex].id
                    GameManager.games.splice(gameIndex, 1)
                    res({ id: id, deleted: true }) //if socket catches deleted we stop broadcasting data
                }
                else res({ deleted: false, clientInfo: GameManager.games[gameIndex].ClientInfo() })
            } catch (err) { rej(err) }
        })
    },
    HandleClick: (userID, guess) => {
        return new Promise((res, rej) => {
            try {
                let gameIndex = GameManager.FindIndexByUserID(userID)
                if (gameIndex == -1) rej({ error: true, message: "User not in game" })
                GameManager.games[gameIndex].HandleClick(userID, guess) //handle click will validate they can click and throw errors if not
                res(GameManager.games[gameIndex]) //we send entire game info to check game conditions and broadcast different for gameover/reset
            } catch (err) { rej(err) }
        })
    },
    ResetCards: gameID => {
        return new Promise((res, rej) => {
            try {
                let gameIndex = GameManager.FindIndexByGameID(gameID)
                if (gameIndex == -1) rej({ error: true, message: "Game not found?" })
                setTimeout(() => {
                    try {
                        GameManager.games[gameIndex].ResetCards()
                        res(GameManager.games[gameIndex])
                    } catch {
                        rej({ error: true, message: "Game was Deleted" })
                    }

                }, 3000)
            } catch (err) { rej(err) }
        })
    },
    SkipUser: userID => {
        return new Promise((resolve, reject) => {
            try {
                let index = FindIndexByUserID(userID)
                GameManager.games[index].NextTurn()
                resolve({ skipped: true, users: GameManager.games[index].users })
            }
            catch (err) {
                reject(err)
            }
        })
    }
}

