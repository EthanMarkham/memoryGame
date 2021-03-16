const fs = require('fs')
const shortid = require('shortid');
//set storage for on-going this.games

class Game {
    constructor(user, playerCount, size) {
        console.log('Creating Game')
        const newGameValues = getGameValues(size)
        this.id = shortid.generate(),
        this.users = [{ username: user.username, id: user.id, matches: 0, color: randomColor(), upNext: true }],
        this.playerCount = playerCount,
        this.inProgress = (playerCount !== 1) ? false : true,
        this.completed = false, //will enter date time for completed at/auto delete
        this.round = 0,
        this.currentGuesses = [],
        this.message = (playerCount !== 1) ? "Waiting for players!" : "Guess a square!",
        this.answers = newGameValues.answers
        this.currentSquares = newGameValues.current
        this.defaultSquares = newGameValues.defaults
        this.resetting = false
    }
    //add user to game
    AddUser(user){
        if (this.users.length >= this.playerCount) throw Error("Game full")
        if (!user) throw Error("Invalid User")

        this.users.push({ username: user.username, matches: 0, color: randomColor(), upNext: false })

        if (this.users.length === this.playerCount) {
            this.inProgress = true
            this.message = `${user.username} just joined! Good luck!`
        }
        else {
            this.message = `${user.username} just joined! Waiting for more players!`
        }
    }
    //reset cards to default on game
    ResetCards() { 
        console.log('Reseting Cards')
        this.currentSquares = this.defaultSquares.slice();
        this.currentGuesses = []
        this.message = "Guess a Square"
        this.resetting = false
        return
    }

    //handle a guess from user -- returns true or false to start a reset
    HandleClick(userID, guess){
        const userIndex = this.users.findIndex(u => u.id == userID)
        console.log(`Registering Click: User #${userIndex} is clicking ${guess} on game: ${this.id}`)

        //verify they can make a guess
        if (this.currentGuesses.length >= 2) throw Error("No guesses allowed rn!")
        if (userIndex === -1) throw Error("You're not in this game?")
        if (!this.users[userIndex].upNext) throw Error("Wait your turn plz")
        if (this.currentSquares[guess].value !== "*") throw Error("You already guessed that brrr")

        //update new values
        this.currentSquares[guess] = this.answers[guess]
        this.currentGuesses.push({ index: guess, value: this.answers[guess].value })

        //if guess at 2 look for match
        if (this.currentGuesses.length === 2) {
            if (this.currentGuesses[0].value === this.currentGuesses[1].value) {
                this.message = "Nice Match!"
                //set match colors for two squares
                this.currentSquares[this.currentGuesses[0].index].matchColor = this.users[userIndex].color
                this.currentSquares[guess].matchColor = this.users[userIndex].color

                //update new default squares and inc user match count
                this.defaultSquares = this.currentSquares.slice()
                this.users[userIndex].matches++
            } else {
                this.message = "Oof! Try Again!"
            }
            let nextUserIndex = (userIndex + 1 < this.users.count) ? userIndex + 1 : 0
            this.users[userIndex].upNext = false
            this.users[nextUserIndex].upNext = true
            this.round++
            //start reset
            this.resetting == true
        }
        return
    }
    //get client info for game
    ClientInfo() {
        let response = {
            squares: this.currentSquares,
            users: this.users,
            playerCount: this.playerCount,
            inProgress: this.inProgress,
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
module.exports.Game = Game
