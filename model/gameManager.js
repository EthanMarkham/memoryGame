const fs = require('fs')
const User = require("./user.model");
const shortid = require('shortid');
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
        return this.games.filter(g => !g.completed && g.users.length < g.playerCount)
    }
    //find game indexes
    FindGameIndexByUserID(userID) {
        try {
            return this.games.filter(g => !g.completed).findIndex(g => g.users.map(u => u.id).indexOf(userID) != -1)
        } catch {
            return { error: { message: "game not found" } }
        }
    }
    FindGameIndexById(gameID) {
        const gameIndex = this.games.findIndex(g => g.id === gameID)

        if (!gameIndex) {
            return null
        }
        else return gameIndex
    }
    //get game 
    GetGameByIndex(index) {
        if (!this.games || index === -1) return { error: { message: "game not found" } }
        return this.games[index]
    }
    //get client info for game
    ClientInfo(index) {
        if (!this.games || index === -1) return { error: { message: "game not found" } }
        let response = {
            squares: this.games[index].squares.current,
            users: this.games[index].users,
            playerCount: this.games[index].playerCount,
            inProgress: this.games[index].inProgress,
            round: this.games[index].round,
            cardsShowing: this.games[index].currentGuesses.length,
            message: this.games[index].message,
            id: this.games[index].id
        }
        return response
    }
    //add user to game
    AddUser(userID, gameID) {
        let errors = []
        //const user = await User.findById(reuserId);
        const gameIndex = this.games.findIndex(g => g.id == gameID)

        if (!gameIndex) errors.push({ type: 'game', message: "Game does not exist" })

        if (this.games[gameIndex].users.length >= this.games[gameIndx].playerCount) {
            error = { type: 'game', message: "Game full" }
            return error
        }

        this.games[gameIndex].users.push({ username: user.username, matches: 0, color: randomColor(), upNext: false })

        if (this.games[gameIndex].users.length === this.games[gameIndex].playerCount) {
            this.games[gameIndex].inProgress = true
            this.games[gameIndex].message = `${user.username} just joined! Good luck!`
        }
        else {
            this.games[gameIndex].message = `${user.username} just joined! Waiting for more players!`
        }
        return error
    }
    //create new game
    NewGame = async (userID, playerCount) => {
        const user = await User.findById(userID);
        if (!user) return { error: { type: "auth", message: "user not found" } }

        if (this.games.filter(g => g.completedAt == null).map(g => g.users.map(u => u.id)).indexOf(user.id) !== -1) {
            return { error: { type: 'game', message: "User already in a game!" } }
        }
        let newGame = {
            id: shortid.generate(),
            users: [{ username: user.username, id: user.id, matches: 0, color: randomColor(), upNext: true }],
            playerCount: playerCount,
            inProgress: (playerCount !== 1) ? false : true,
            completed: false, //will enter date time for completed at/auto delete
            round: 0,
            currentGuesses: [],
            message: (playerCount !== 1) ? "Waiting for players!" : "Guess a square!",
            squares: getGameValues()
        }
        this.games.push(newGame)
        return newGame
    }
    //reset cards to default on game
    ResetCards(gameIndex) { 
        this.games[gameIndex].squares.current = this.games[gameIndex].squares.defaults.slice();
        this.games[gameIndex].currentGuesses = []
        this.games[gameIndex].message = "Guess a Square"
    }
    //handle a guess from user
    HandleClick(userID, guess) {
        const gameIndex = this.FindGameIndexByUserID(userID)
        const userIndex = this.games[gameIndex].users.findIndex(u => u.id == userID)
        console.log(`user number ${userIndex} is clicking ${guess} on game number ${gameIndex}`)
        let startReset = false
        //verify they can make a guess
        if (this.games[gameIndex].currentGuesses.length >= 2) return { error: { type: 'move', message: "No guesses allowed rn!" } }
        if (gameIndex.error) return { error: { type: 'move', message: "Game seems to have vanished? oops" } }
        if (userIndex === -1) return { error: { type: 'move', message: "You're not in this game?" } }
        if (!this.games[gameIndex].users[userIndex].upNext) return { error: { type: 'move', message: "Wait your turn plz" } }
        if (this.games[gameIndex].squares.current[guess].value !== "*") return { error: { type: 'move', message: "You already guessed that brrr" } }
        //update new values
        this.games[gameIndex].squares.current[guess] = this.games[gameIndex].squares.answers[guess]
        this.games[gameIndex].currentGuesses.push({ index: guess, value: this.games[gameIndex].squares.answers[guess].value })
        //if guess at 2 look for match
        if (this.games[gameIndex].currentGuesses.length === 2) {
            if (this.games[gameIndex].currentGuesses[0].value === this.games[gameIndex].currentGuesses[1].value) {
                this.games[gameIndex].message = "Nice Match!"
                //set match colors for two squares
                this.games[gameIndex].squares.current[this.games[gameIndex].currentGuesses[0].index].matchColor = this.games[gameIndex].users[userIndex].color
                this.games[gameIndex].squares.current[guess].matchColor = this.games[gameIndex].users[userIndex].color

                //update new default squares and inc user match count
                this.games[gameIndex].squares.defaults = this.games[gameIndex].squares.current
                this.games[gameIndex].users[userIndex].matches++
            } else {
                this.games[gameIndex].message = "Oof! Try Again!"
            }
            let nextUserIndex = (userIndex + 1 < this.games[gameIndex].users.count) ? userIndex + 1 : 0
            this.games[gameIndex].users[userIndex].upNext = false
            this.games[gameIndex].users[nextUserIndex].upNext = true
            this.games[gameIndex].round++
            //emit new game info then start a reset to
            this.games[gameIndex]
            startReset = true
        }
        return { gameIndex: gameIndex, reset: startReset }
    }

}

function getGameValues(size) {
    let file1Names = fs.readdirSync('./public/cards/paired/1') //,
    file2Names = fs.readdirSync('./public/cards/paired/2')
    _halfBoard = (size) ? size / 2 : file1Names.length
    //make new array based off size -> duplicate all values for pairs with different image paths-> randomize order 
    let answers = [...Array(_halfBoard).keys()].flatMap(i => [{
        value: i,
        image: '/cards/paired/1/' + file1Names[i],
        civ: ucFirst(file1Names[i].split('.')[0]) //Get civ name by looking at file name. 
    }, {
        value: i,
        image: '/cards/paired/2/' + file2Names[i],
        civ: ucFirst(file1Names[i].split('.')[0])
    }]).sort(() => Math.random() - 0.5)

    let defaults = Array(answers.length).fill({
        value: "*",
        image: "/cards/back.PNG"
    })
    return { answers: answers, defaults: defaults, current: defaults.slice() }
}

function randomColor() {
    return '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
}

function ucFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
