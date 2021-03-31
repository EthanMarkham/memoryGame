const fs = require('fs')
const shortid = require('shortid');
//set storage for on-going this.games

class Game {
    constructor(user, playerCount, size, name) {
        let newGameValues = getGameValues(size)
        this.id = shortid.generate()
        this.name = name
        this.round = 0
        this.playerCount = parseInt(playerCount)
        this.currentGuesses = []
        this.users = [{ username: user.username, id: user.id, matches: 0, color: randomColor(), upNext: true, active: true }]
        this.status = (this.playerCount !== 1) ? "WAITING" : "ONGOING"
        this.message = (playerCount !== 1) ? "Waiting for players!" : "Guess a square!"
        this.answers = newGameValues.answers
        this.currentSquares = newGameValues.current
        this.defaultSquares = newGameValues.defaults
    }
    //add user to game
    AddUser(user) {
        if (this.users.length >= this.playerCount) throw Error("Game full")
        if (!user) throw Error("Invalid User")

        this.users.push({ username: user.username, id: user.id, matches: 0, color: randomColor(), upNext: false, active: true })
        console.log(this.users)
        if (this.users.length === this.playerCount) {
            this.status = "ONGOING"
            this.message = `${user.username} just joined! Good luck!`
        }
        else {
            this.message = `${user.username} just joined! Waiting for more players!`
        }
    }
    RemoveUser(user) {
        let userIndex = this.users.find(u => u.id === user.id)
        this.users[userIndex].active = false
    }
    //reset cards to default on game
    ResetCards() {
        console.log('Reseting Cards')
        this.currentSquares = this.defaultSquares.slice()
        this.currentGuesses = []
        this.resetting= false
        this.message = "Guess a Square"
    }
    NextTurn() {
        const userIndex = this.users.findIndex(u => u.upNext)
        var nextUserIndex
        do {
            nextUserIndex = (userIndex + 1 < this.users.length) ? userIndex + 1 : 0
            if (userIndex !== -1) this.users[userIndex].upNext = false
        } while (!this.users[nextUserIndex].active) //loop til we find active user
        this.users[nextUserIndex].upNext = true
    }
    //handle a guess from user -- returns true or false to start a reset
    HandleClick(userID, guess) {
        const userIndex = this.users.findIndex(u => u.id == userID)
        let guessIndex = this.answers.findIndex(a => guess == a.id)
        console.log(`Registering Click: User #${userIndex} is clicking ${guess} #${guessIndex} on game: ${this.id}`)
        //verify they can make a guess
        if (this.currentGuesses.length >= 2) throw Error("No guesses allowed rn!")
        if (userIndex === -1) throw Error("You're not in this game?")
        if (this.status !== "ONGOING") throw Error("Game not in progress!")
        if (!this.users[userIndex].upNext) throw Error("Wait your turn plz")
        if (this.currentSquares[guessIndex].value !== "*") throw Error("You already guessed that brrr")

        //update new values
        this.currentSquares[guessIndex] = this.answers[guessIndex]
        this.currentSquares[guessIndex].flipped = true
        this.currentGuesses.push({ index: guessIndex, value: this.answers[guessIndex].value })

        //if guess at 2 look for match
        if (this.currentGuesses.length === 2) {
            this.resetting = true
            this.round++
            //get rid of old flipped for frontend
            if (this.currentGuesses[0].value === this.currentGuesses[1].value) {
                this.message = "Nice Match!"
                //set match colors for two squares
                this.currentSquares[this.currentGuesses[0].index].matchColor = this.users[userIndex].color
                this.currentSquares[guessIndex].matchColor = this.users[userIndex].color

                //update new default squares and inc user match count
                this.defaultSquares = this.currentSquares.slice()
                this.users[userIndex].matches++

                //if default squares does not contain '*'' values were done
                if (this.defaultSquares.findIndex(s => s.value === "*") === -1) {
                    this.status = "GAME_OVER"
                    this.resetting = false
                    let winner = this.users.sort((a, b) => { return a.matches - b.matches })
                    this.message = `Game over!!!! ${winner[0].username} won with ${winner[0].matches} matches!`
                }
            } else {
                this.message = "Oof! Try Again!"
                this.NextTurn()
            }
        }
    }
    //get client info for game
    ClientInfo() {
        let response = {
            name: this.name,
            squares: this.currentSquares.map((sq, index) => {
                return ({
                    id: this.answers[index].id,
                    flipped: sq.flipped,
                    civ: sq.civ,
                    image: sq.image
                })
            }),
            status: this.status,
            users: this.users.map(u => ({ username: u.username, color: u.color, matches: u.matches, upNext: u.upNext })),
            name: this.name,
            status: this.inProgress,
            round: this.round,
            cardsShowing: this.currentGuesses.length,
            message: this.message,
            id: this.id
        }
        return response
    }
}
//Helper functions
function getGameValues(size) {
    var fileNames = fs.readdirSync('./public/cards/paired/1') //,

    let itemsToRemove = ((fileNames.length * 2) - size)  //randomly removing difference because its easier than randomly selecting cards
    for (let i = 0; i < itemsToRemove / 2; i++) {
        let removing = Math.floor(Math.random() * fileNames.length)
        fileNames.splice(removing, 1)
    }
    //make new array based off size -> duplicate all values for pairs with different image paths-> randomize order 
    let answers = [...Array(fileNames.length).keys()].flatMap(i => [{
        value: i,
        image: '/cards/paired/1/' + fileNames[i],
        civ: ucFirst(fileNames[i].split('.')[0]),//Get civ name by looking at file name. 
        id: shortid.generate()
    }, {
        value: i,
        image: '/cards/paired/2/' + fileNames[i],
        civ: ucFirst(fileNames[i].split('.')[0]),
        id: shortid.generate()
    }]).sort(() => Math.random() - 0.5)

    let defaults = Array(answers.length).fill({
        value: "*",
        image: "/cards/back.PNG"
    })
    return { answers: answers, defaults: defaults, current: defaults.slice() }
}

function randomColor() {
    return '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
}

function ucFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
module.exports = {
    Game: Game
}