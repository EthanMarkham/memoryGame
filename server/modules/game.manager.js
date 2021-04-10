const Game = require("../model/game.model").Game;
const User = require("../model/user.model");
const events = require('events');
const { arrEquals } = require('../helpers/arrayEquals')
const { countdown } = require('../helpers/countdown');

//NEED TO SWITCH FROM LIST FOR GAMES TO ID AS KEY. WAY BETTER AND LESS ERROR PRONE

var GameManager = module.exports = {
    games: [],
    events: new events.EventEmitter(),
    openGames: [],

    GameCount: _ => (GameManager.games.count),
    GetAllGames: _ => GameManager.games,
    GetOpenGames: _ => {
        return GameManager.games
            .filter(g => g.ActiveUsers().length < g.playerCount && g.inProgress)
            .map(g => ({
                players: g.ActiveUsers().length,
                maxPlayers: g.playerCount,
                id: g.id,
                name: g.gameName
            }))
    },
    FindIndexByUserID: userID => {
        try {
            let gameSearch = GameManager.games.filter(g => g.status != "GAME_OVER").map(g => ({ id: g.id, users: g.ActiveUsers().map(u => u.id) }));
            let tempIndex = gameSearch.findIndex(g => g.users.includes(userID));
            return (GameManager.FindIndexByGameID(gameSearch[tempIndex].id))
        }
        catch { return -1 }
    },
    FindIndexByGameID: gameID => GameManager.games.findIndex(g => g.id == gameID),
    CheckUserStatus: userID => {
        return new Promise((resolve, reject) => {
            if (!userID) reject("No credentials")
            let gameIndex = GameManager.FindIndexByUserID(userID)
            if (gameIndex == -1) rej("User not in game")
            resolve(GameManager.games[gameIndex].ClientInfo())
        })
    },
    NewGame: (userID, info) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await User.findById(userID);
                if (!user) {
                    reject({ error: true, message: "No credentials" });
                }
                if (GameManager.FindIndexByUserID(userID) != -1) {
                    reject({ error: true, message: "User already in a game!" });
                }
                //cleaning name
                let filter = require('leo-profanity');
                filter.loadDictionary();
                gameName = filter.clean(info.name);

                let newGame = new Game(user, info.playerCount, info.cardCount, gameName);
                GameManager.games.push(newGame);//
                GameManager.EmitGames();
                resolve(newGame) //send info back so client can join 
            } catch (err) { reject(err); };
        })
    },
    DeleteGame: (gameID) => {
        try {
            let gameIndex = GameManager.FindIndexByGameID(gameID);
            if (GameManager.games[gameIndex].moveTimer) GameManager.games[gameIndex].moveTimer.stop();
            //GameManager.games.splice(gameIndex, 1);
            GameManager.games[gameIndex].moveTimer.inProgress = false;
            return { deleted: true };
        }
        catch {
            return { deleted: false, games: this.games }; //return games to reload if error?
        }
    },
    AddUser: (userID, gameID) => {
        return new Promise((resolve, reject) => {
            let gameIndex = GameManager.FindIndexByGameID(gameID); //if we search by user itll ignore because user no longer in game
            if (gameIndex == -1) rej({ error: true, message: "Game not found" })
            try {
                User.findById(userID)
                    .then(user => {
                        GameManager.games[gameIndex].AddUser(user);
                        GameManager.EmitInfo(GameManager.games[gameIndex].ClientInfo());
                        resolve(GameManager.games[gameIndex].ClientInfo())  //send game info after added)
                    }).catch(err => reject(err))
            } catch (err) { reject(err) }
        })
    },
    RemoveUser: userID => {
        return new Promise((resolve, reject) => {
            try {
                let gameIndex = GameManager.FindIndexByUserID(userID)
                if (gameIndex == -1) reject({ error: true, message: "Game not found" })
                GameManager.games[gameIndex].RemoveUser(userID)
                    .then(g => {
                        if (g.status == "DELETE") {
                            resolve(() => GameManager.DeleteGame(GameManager.games[gameIndex].id)) //resolve id to leave room
                        }
                        else {
                            GameManager.games[gameIndex].moveTimer.stop();
                            GameManager.SetMoveTimer(GameManager.games[gameIndex].id);
                            GameManager.EmitInfo(GameManager.games[gameIndex].ClientInfo());
                            resolve();
                        }
                    })
            } catch (err) { reject(err) }
        })
    },
    HandleClick: (userID, guess) => {
        return new Promise((resolve, reject) => {
            let gameIndex = GameManager.FindIndexByUserID(userID)
            if (gameIndex == -1) reject({ error: true, message: "User not in game" })
            if (GameManager.games[gameIndex].moveTimer) GameManager.games[gameIndex].moveTimer.stop();
            //Handle Click
            GameManager.games[gameIndex].HandleClick(userID, guess)
                .then(game => {
                    //Set move timer
                    GameManager.EmitInfo(GameManager.games[gameIndex].ClientInfo());
                    //If resetting broadcast 2x
                    if (game.status == "RESETTING") {
                        setTimeout(() => {
                            GameManager.games[gameIndex].ResetCards();
                            GameManager.EmitInfo(GameManager.games[gameIndex].ClientInfo());
                            GameManager.SetMoveTimer(game.id);
                            resolve()
                        }, 3000)
                    }
                    //If Gameober set timeout to delete game
                    else if (game.status == "GAME_OVER") {
                        if (GameManager.games[gameIndex].moveTimer) GameManager.games[gameIndex].moveTimer.stop();
                        setTimeout(() => {
                            DeleteGame(GameManager.games[gameIndex].id)
                        }, 10000)
                        resolve()
                    }
                    else {
                        GameManager.EmitInfo(gameIndex);
                        GameManager.SetMoveTimer(game.id);
                        resolve();
                    }
                })
                .catch(e => reject(e))
        })
    },
    SkipUser: userID => {
        return new Promise((resolve, reject) => {
            try {
                let gameIndex = FindIndexByUserID(userID)
                GameManager.games[gameIndex].moveTimer.stop();
                GameManager.games[gameIndex].NextTurn()
                if (GameManager.games[gameIndex].ActiveUsers().length > 1) { //if more than 1 people start move timer
                    GameManager.SetMoveTimer(GameManager.games[gameIndex].id);
                }
                resolve(() => GameManager.EmitInfo(GameManager.games[gameIndex].ClientInfo()))
            }
            catch (err) {
                reject(err)
            }
        })
    },
    EmitInfo: info => GameManager.events.emit("CLIENT_INFO", info),

    EmitGames: _ => {
        let games = GameManager.GetOpenGames();
        if (games.length == 0 && GameManager.openGames.length != 0) {
            GameManager.events.emit("GAME_LIST", [])
            return
        }
        else if (!arrEquals( //only emit games if gamelist has changed
            GameManager.openGames.map(g => g.id),
            games.map(g => g.id)
        )) {
            GameManager.openGames = games
            GameManager.events.emit("GAME_LIST", GameManager.openGames)
            return
        }
    },
    EmitMessage: (id, message) => GameManager.events.emit("GAME_MESSAGE", { id: id, message: message }),
    EmitTimer: (timeLeft, gameID) => GameManager.events.emit("GAME_TIMER", { id: gameID, timeLeft: timeLeft }),
    SetMoveTimer: id => {
        let index = GameManager.FindIndexByGameID(id)
        if (index != -1) {
            if (GameManager.games[index].moveTimer) GameManager.games[index].moveTimer.stop();
            if (GameManager.games[index].ActiveUsers().length > 1) {
                GameManager.games[index].moveTimer = new countdown({
                    seconds: 45,
                    onUpdateStatus: sec =>GameManager.EmitTimer(sec, id),
                    onCounterEnd: _ => {
                        let gameIndex = GameManager.FindIndexByGameID(id); //find index again here for closure
                        if (gameIndex != -1) {
                            GameManager.games[gameIndex].NextTurn();
                            GameManager.EmitInfo(GameManager.games[gameIndex].ClientInfo());
                            GameManager.EmitMessage(id, "Times Up!");
                        }
                    }
                })
                GameManager.games[index].moveTimer.start();
            }
        }
    }
}


