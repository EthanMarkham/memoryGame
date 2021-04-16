const Game = require("../model/game.model").Game;
const User = require("../model/user.model");
const events = require('events');
const { arrEquals } = require('./arrayEquals')
const { countdown } = require('./countdown');

//NEED TO SWITCH FROM LIST FOR GAMES TO ID AS KEY. WAY BETTER AND LESS ERROR PRONE

var GameManager = module.exports = {
    games: {
        filter: (predicate) =>
            Object.keys(GameManager.games)
                .filter(key => (
                    key != "filter"
                    && key != "openGames"
                    && GameManager.games[key] != null
                    && predicate(GameManager.games[key]))
                )
                .reduce((res, key) => (res[key] = GameManager.games[key], res), {}),
        openGames: () =>
            Object.keys(GameManager.games)
                .filter(key => key != "filter" && key != "openGames")
                .filter(key => (
                    GameManager.games[key]
                    && GameManager.games[key].ActiveUsers().length < GameManager.games[key].playerCount
                    && GameManager.games[key].inProgress
                ))
                .reduce((res, key) => (res[key] = GameManager.games[key], res), {}),
    },
    events: new events.EventEmitter(),
    openGames: [],

    GameCount: _ => (GameManager.games.count),
    GetAllGames: _ => GameManager.games,
    GetOpenGames: _ => {
        let openGames = GameManager.games.openGames();
        return Object.keys(openGames).map(k => ({
            players: GameManager.games[k].ActiveUsers().length,
            maxPlayers: GameManager.games[k].playerCount,
            id: GameManager.games[k].id,
            name: GameManager.games[k].gameName
        }));
    },
    FindGameByUserID: userID => {
        let gameSearch = GameManager.games
            .filter(g =>
                g.status != "GAME_OVER"
                && g.ActiveUsers()
                    .map(u => u.id)
                    .includes(userID));
        if (Object.keys(gameSearch).length != 1) return -1;
        else return Object.keys(gameSearch)[0];
    },
    GetUserGame: userID => {
        return new Promise((resolve, reject) => {
            if (!userID) reject("No credentials")
            let gameID = GameManager.FindGameByUserID(userID)
            if (gameID == -1) rej("User not in game")
            resolve(GameManager.games[gameID].ClientInfo())
        })
    },
    NewGame: (userID, info) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await User.findById(userID);
                if (!user) {
                    reject({ error: true, message: "No credentials" });
                }
                if (GameManager.FindGameByUserID(userID) != -1) {
                    reject({ error: true, message: "User already in a game!" });
                }
                //cleaning name
                let filter = require('leo-profanity');
                filter.loadDictionary();
                gameName = filter.clean(info.name);

                let newGame = new Game(user, info.playerCount, info.cardCount, gameName);
                GameManager.games[newGame.id] = newGame;//
                GameManager.EmitGames();
                resolve(newGame) //send info back so client can join 
            } catch (err) { reject(err); };
        })
    },
    AddUser: (userID, gameID) => {
        return new Promise((resolve, reject) => {
            try {
                User.findById(userID)
                    .then(user => {
                        GameManager.games[gameID].AddUser(user);
                        GameManager.EmitInfo(GameManager.games[gameID].ClientInfo());
                        GameManager.EmitGames(); //emit game changes if any
                        resolve(GameManager.games[gameID].ClientInfo())  //send game info after added)
                    }).catch(err => reject(err))
            } catch (err) { reject(err) }
        })
    },
    RemoveUser: userID => {
        return new Promise((resolve, reject) => {
            try {
                let gameID = GameManager.FindGameByUserID(userID)
                if (gameID == -1) reject({ error: true, message: "Game not found" })
                GameManager.games[gameID].RemoveUser(userID)
                    .then(g => {
                        GameManager.EmitGames();
                        if (g.status == "DELETE") {
                            resolve(() => {
                                GameManager.games[gameID] = null; //delete game
                                return (gameID); //resolve id to leave room
                            })
                        }
                        else {
                            GameManager.SetMoveTimer(GameManager.games[gameID].id);
                            GameManager.EmitInfo(GameManager.games[gameID].ClientInfo());
                            resolve(gameID); //resolve gameID to broadcast new info
                        }
                    })
            } catch (err) { reject(err) }
        })
    },
    HandleClick: (userID, guess) => {
        return new Promise((resolve, reject) => {
            let gameID = GameManager.FindGameByUserID(userID)
            if (gameID == -1) reject({ error: true, message: "User not in game" })
            if (GameManager.games[gameID].moveTimer) GameManager.games[gameID].moveTimer.stop(); //stop move timer after click
            //Handle Click
            GameManager.games[gameID].HandleClick(userID, guess)
                .then(game => {
                    GameManager.EmitInfo(GameManager.games[gameID].ClientInfo());
                    //If resetting broadcast 2x
                    if (game.status == "RESETTING") {
                        setTimeout(() => {
                            if (GameManager.games[gameID]) {//check that it exists incase it was deleted in timeout
                                GameManager.games[gameID].ResetCards(true)
                                    .then(_ => {
                                        GameManager.EmitInfo(GameManager.games[gameID].ClientInfo());
                                        GameManager.SetMoveTimer(gameID);
                                        resolve();
                                    })
                            }
                        }, 3000)
                    }
                    //If Gameober set timeout to delete game
                    else if (game.status == "GAME_OVER") {
                        if (GameManager.games[gameID].moveTimer) GameManager.games[gameID].moveTimer.stop();
                        GameManager.EmitInfo(GameManager.games[gameID].ClientInfo());
                        GameManager.EmitGames();
                        setTimeout(() => {
                            GameManager.games[gameID] = null;
                        }, 10000)
                        resolve()
                    }
                    else {
                        GameManager.EmitInfo(GameManager.games[gameID].ClientInfo());
                        GameManager.SetMoveTimer(gameID);
                        resolve();
                    }
                })
                .catch(e => reject(e))
        })
    },
    SkipUserByID: userID => {
        return new Promise((resolve, reject) => {
            try {
                let gameID = FindIndexByUserID(userID)
                GameManager.games[gameID].moveTimer.stop();
                GameManager.games[gameID].NextTurn()
                if (GameManager.games[gameID].ActiveUsers().length > 1) { //if more than 1 people start move timer
                    GameManager.SetMoveTimer(GameManager.games[gameID].id);
                }
                resolve(() => GameManager.EmitInfo(GameManager.games[gameID].ClientInfo()))
            }
            catch (err) {
                reject(err)
            }
        })
    },
    SkipUser: gameID => {
        return new Promise((resolve, reject) => {
            try {
                GameManager.games[gameID].moveTimer.stop();
                GameManager.games[gameID].NextTurn()
                if (GameManager.games[gameID].ActiveUsers().length > 1) { //if more than 1 people start move timer
                    GameManager.SetMoveTimer(GameManager.games[gameID].id);
                }
                resolve(() => GameManager.EmitInfo(GameManager.games[gameID].ClientInfo()))
            }
            catch (err) {
                reject(err)
            }
        })
    },
    EmitInfo: info => GameManager.events.emit("CLIENT_INFO", info),

    EmitGames: _ => {
        let games = GameManager.GetOpenGames();
        console.log('checking games', games, GameManager.openGames)
        if (games.length == 0 && GameManager.openGames.length != 0) {
            GameManager.events.emit("GAME_LIST", [])
            return
        }
        else if (!arrEquals(GameManager.openGames.map(g => g.id), games.map(g => g.id))) {
            GameManager.openGames = games
            GameManager.events.emit("GAME_LIST", games)
            return
        }
    },
    EmitMessage: (id, message) => GameManager.events.emit("GAME_MESSAGE", { id: id, message: message }),
    EmitTimer: (timeLeft, gameID) => GameManager.events.emit("GAME_TIMER", { id: gameID, timeLeft: timeLeft }),
    SetMoveTimer: id => {
        if (GameManager.games[id].moveTimer) GameManager.games[id].moveTimer.stop();
        if (GameManager.games[id].ActiveUsers().length > 1) {
            GameManager.games[id].moveTimer = new countdown({
                seconds: 45,
                onUpdateStatus: sec => GameManager.EmitTimer(sec, id),
                onCounterEnd: _ => {
                    if (GameManager.games[id]) { //double check object exists incase it was deleteed
                        GameManager.SkipUser(id);
                        GameManager.EmitInfo(GameManager.games[id].ClientInfo());
                        GameManager.EmitMessage(id, "Times Up!");
                    }
                }
            })
            GameManager.games[id].moveTimer.start();
        }
    }
}


