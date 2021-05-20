const Game = require("../model/game.model").Game;
const User = require("../schemas/user.model");
const events = require('events');
const { arrEquals } = require('../utils/arrayEquals')

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

                //add listeners to relay info to sockket
                GameManager.games[newGame.id].events.on("GAME_INFO", data => GameManager.events.emit("CLIENT_INFO", data));
                GameManager.games[newGame.id].events.on("GAME_OVER", data => GameManager.events.emit("GAME_OVER", data));
                GameManager.games[newGame.id].events.on("START_TIMER", data =>  GameManager.events.emit("START_TIMER", data));
                GameManager.games[newGame.id].events.on("OUT_OF_TIME", data =>  GameManager.events.emit("OUT_OF_TIME", data));
                GameManager.games[newGame.id].events.on("CLEAR_TIMER", data =>  GameManager.events.emit("CLEAR_TIMER", data));

                resolve(newGame) //send info back so client can join 
            } catch (err) { reject(err); };
        })
    },
    DeleteGame: gameID => {
        GameManager.games[gameID].events.removeAllListeners();
        GameManager.games[gameID] = null;
    },
    AddUser: (userID, gameID) => {
        return new Promise((resolve, reject) => {
            try {
                User.findById(userID)
                    .then(user => {
                        GameManager.games[gameID].AddUser(user);
                        GameManager.EmitGames(); //emit game changes if any
                        resolve();
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
                        if (g.status == "DELETE") GameManager.DeleteGame(gameID);
                        GameManager.EmitGames();
                        resolve(gameID);
                    })
            } catch (err) { reject(err) }
        })
    },
    HandleClick: (userID, guess) => {
        return new Promise((resolve, reject) => {
            let gameID = GameManager.FindGameByUserID(userID)
            if (gameID == -1) reject({ error: true, message: "User not in game" })
            //Handle Click
            GameManager.games[gameID].HandleClick(userID, guess)
                .catch(e => reject(e))
        })
    },
    AdminSkipUser: gameID => {
        return new Promise((resolve, reject) => {
            try {
                GameManager.games[gameID].NextTurn();
                GameManager.events.emit("GAME_MESSAGE", {message: 'User skipped by admin!', data: GameManager.games[gameID].ClientInfo});
                resolve();
            }
            catch (err) { reject(err); }   
        });
    },

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
}


