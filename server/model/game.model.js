const fs = require('fs')
const shortid = require('shortid');
class Game {
    constructor(user, playerCountString, size, gameName) {
        if (![1,2,3,4].includes(parseInt(playerCountString))) throw new Error("Stop trying to break me!")
        if (![16,48,72,4].includes(parseInt(size))) throw new Error("Stop trying to break me!")
        this.id = shortid.generate()
        this.squares = getthisValues(size)
        this.playerCount = parseInt(playerCountString)
        this.users = [{ username: user.username, id: user.id, matches: 0, color: randomColor(), upNext: true, active: true }]
        this.status = (this.playerCount !== 1) ? "WAITING" : "ONGOING"
        this.message = (this.playerCount !== 1) ? "Waiting for players!" : "Guess a square!"
        this.round = 0
        this.gameName = gameName
        this.currentGuesses = []
    }
    AddUser = user => {
        if (this.users.length >= this.playerCount) throw Error("GAME IS FULL")
        if (!user) throw Error("Invalid User")
        this.users.push({ username: user.username, id: user.id, matches: 0, color: randomColor(), upNext: false, active: true })
        if (this.users.length === this.playerCount) {
            this.status = "ONGOING"
            this.message = `${user.username} just joined! Good luck!`
        } else {
            this.message = `${user.username} just joined! Waiting for more players!`
        }
    }
    RemoveUser = id => {
        return new Promise((resolve, reject) => {
            this.users.find(u => u.id === id).active = false
            if (this.users.filter(u => u.active).length === 0) {
                this.status = "DELETE"
                resolve(this) 
            }
            else {
                if (this.users.find(u => u.id === id).upNext) this.NextTurn()
                resolve(this)
            }
        })
    }
    ResetCards = _ => {
        this.squares.current = this.squares.defaults.slice()
        this.currentGuesses = []
        this.resetting = false
        this.status = "ONGOING"
        this.message = "Guess a Square"
    }
    NextTurn = _ => {
        if (this.users.filter(u => u.active).length >= 1) {
            var next;
            var cur = this.users.findIndex(u => u.upNext);
            do {
                next = (cur + 1 < this.users.length) ? cur + 1 : 0;
                this.users[cur].upNext = false;
                this.users[next].upNext = true;
                cur = (cur + 1 < this.users.length) ? cur++ : 0;
            } while (!this.users.find(u => u.upNext).active) //loop til we find active user
        }
    }
    HandleClick = (userID, guess) => {
        return new Promise((resolve, reject) => {
            const userIndex = this.users.findIndex(u => u.id == userID)
            let guessIndex = this.squares.answers.findIndex(a => guess == a.id)
            console.log(`Registering Click: User #${userIndex} is clicking ${guess} #${guessIndex} on this: ${this.id}`)
            //verify they can make a guess
            if (this.currentGuesses.length >= 2) reject("No guesses allowed rn!")
            if (userIndex === -1) reject("You're not in this this?")
            if (this.status !== "ONGOING") reject("this not in progress!")
            if (!this.users[userIndex].upNext) reject("Wait your turn plz")
            if (this.squares.current[guessIndex].value !== "*") reject("You already guessed that brrr")
    
            //update new values
            this.squares.current[guessIndex] = this.squares.answers[guessIndex]
            this.squares.current[guessIndex].flipped = true
            this.currentGuesses.push({ index: guessIndex, value: this.squares.answers[guessIndex].value })
    
            //if guess at 2 look for match
            if (this.currentGuesses.length === 2) {
                this.resetting = true
                this.round++
                //get rid of old flipped for frontend
                if (this.currentGuesses[0].value === this.currentGuesses[1].value) {
                    this.message = "Nice Match!"
                    //set match colors for two squares
                    this.squares.current[this.currentGuesses[0].index].matchColor = this.users[userIndex].color
                    this.squares.current[guessIndex].matchColor = this.users[userIndex].color
    
                    //update new default squares and inc user match count
                    this.squares.defaults = this.squares.current.slice()
                    this.users[userIndex].matches++
    
                    //if default squares does not contain '*'' values were done
                    if (this.squares.defaults.findIndex(s => s.value === "*") === -1) {
                        this.status = "GAME_OVER"
                        this.resetting = false
                        this.users = this.users.map(u => ({...u, active: false}))
                        let winner = this.users.sort((a, b) => { return a.matches - b.matches })
                        this.message = `this over!!!! ${winner[0].username} won with ${winner[0].matches} matches!`
                        resolve(this)

                    }
                } else {
                    this.message = "Oof! Try Again!"
                    this.status = "RESETTING"
                    this.NextTurn()
                    resolve(this)
                }
            }
            else resolve(this)
        })
        
    }
    ClientInfo = _ => {
        let squares = this.squares.current.map((sq, index) => {
            return ({
                id: this.squares.answers[index].id,
                flipped: sq.flipped,
                civ: sq.civ,
                image: sq.image
            })
        })
        return ({
            name: this.gameName,
            squares: squares,
            status: this.status,
            users: this.users.map(u => ({ username: u.username, color: u.color, matches: u.matches, upNext: u.upNext, active: u.active })),
            round: this.round,
            cardsShowing: this.currentGuesses.length,
            message: this.message,
            id: this.id
        })
    }
    UpNext = _ => this.users.find(u => u.upNext)
}
//Helper functions
function getthisValues(size) {
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

module.exports.Game = (user, playerCountString, size, gameName) => {return new Game(user, playerCountString, size, gameName)}
