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
        else return (this.games.filter(g => !g.completed && g.users.length < g.playerCount))
    }

    FindIndexByUserID(userID) {
        let output = this.games.filter(g => !g.completed).findIndex(g => g.users.map(u => u.id).indexOf(userID) != -1)
        if (output !== -1) return output
        else throw Error("Game not Found!")
    }
    FindIndexByGameID(gameID) {
        let output = this.games.findIndex(g => g.id == gameID)
        if (output !== -1) return output
        else throw Error("Game not Found!")
    }

    GetClientInfo(userID) {    
        const index = this.FindIndexByUserID(userID)
        return {game: this.games[index].ClientInfo(), index: index}
    }
    GetGameInfo(userID) {
        const index = this.FindIndexByUserID(userID)
        return {game: this.games[index], index: index}
    }
    //create new game
    NewGame(user, playerCount) {
        const out = new Promise((resolve, reject) => {
            if (this.games.filter(g => g.completedAt == null).map(g => g.users.map(u => u.id)).indexOf(user.id) !== -1) reject("User already in a game!")
            this.games.push(new Game(user, playerCount))
            resolve({game: this.games[this.games.length - 1], index: this.games.length - 1})
        })
        return out
    }
    AddUser(user, gameID) {
        const out = new Promise((resolve, reject) => {
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
        const out = new Promise((resolve) => {
            const gameIndex = this.FindIndexByUserID(userID)
            let resetCards = this.games[gameIndex].HandleClick(userID, guess)

            resolve({game: this.games[gameIndex], index: gameIndex})
        })
        return out
    }

    ResetCards(userID){
        const out = new Promise((resolve) => {
            const gameIndex = this.FindIndexByUserID(userID)
            setTimeout(() => {
                this.games[gameIndex].ResetCards()
                resolve({game: this.games[gameIndex], index: gameIndex})
            }, 3000)
        })
        return out 
    }
}

