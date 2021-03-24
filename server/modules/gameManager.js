const Game = require("../model/game.model").Game;

//set storage for on-going this.games
module.exports.GameManager = () => { return new GameManager() }

class GameManager {
    constructor() {
        this.games = []
    }
    GameCount() {
        return this.games.length
    }
    GetOpenGames() {
        if (!this.games) return null
        let gameList = this.games.filter(g => !g.completed && g.users.length < g.playerCount)
        let output = gameList.map(g => ({
            players: g.users.length,
            maxPlayers: g.playerCount,
            id: g.id
        }))
        console.log(output)
        return(output)
    }

    FindIndexByUserID(userID) {
        let output = this.games.findIndex(g => g.users.findIndex(u => u.id === userID) !== -1 && g.completed === false)
        if (output !== -1) return output
        else throw Error("Game not Found!")
    }
    FindIndexByGameID(gameID) {
        let output = this.games.findIndex(g => g.id == gameID)
        if (output !== -1) return output
        else throw Error("Game not Found!")
    }

    GetClientInfo(userID) {    
        return new Promise((resolve, reject) => {
            let index = this.FindIndexByUserID(userID)
            resolve(this.games[index].ClientInfo())
        })
    }
    GetGameOverInfo(gameID) {
        let index = this.FindIndexByGameID(gameID)
        return this.games[index].GameOverInfo()
    }

    //create new game
    NewGame(user, playerCount) {
        let out = new Promise((resolve, reject) => {
            if (this.games.filter(g => g.completed === false).map(g => g.users).findIndex(u => u.id === user.id) !== -1) reject("User already in a game!")
            let newGame = new Game(user, playerCount)
            this.games.push(newGame)
            resolve(newGame.ClientInfo())
        })
        return out
    }
    AddUser(user, gameID) {
        let out = new Promise((resolve, reject) => {
            try {
                let gameIndex = this.FindGameIndexByUserID(user.id)
                this.games[gameIndex].AddUser(user)
                resolve(this.games[gameIndex])
            }
            catch (err) { reject(err) }
        })
        return out
    }
    //handle a guess from user
    HandleClick(userID, guess) {
        return new Promise((resolve) => {
            console.log(guess)
            let gameIndex = this.FindIndexByUserID(userID)
            this.games[gameIndex].HandleClick(userID, guess)
            resolve(this.games[gameIndex])
        })
    }

    ResetCards(userID){
        let out = new Promise((resolve) => {
            let gameIndex = this.FindIndexByUserID(userID)
            setTimeout(() => {
                this.games[gameIndex].ResetCards()
                resolve(this.games[gameIndex])
            }, 3000)
        })
        return out 
    }
}
