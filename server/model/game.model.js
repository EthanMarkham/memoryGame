const shortid = require('shortid');
const events = require('events');
const { getGameValues, randomColor, countdown, diffMinutes } = require('../utils/gameHelpers');
const LeaderBoard = require('../modules/leaderBoard');
const RESET_TIMEOUT = 3000;

class Game {
    constructor(user, playerCountString, size, gameName) {
        if (![1, 2, 3, 4].includes(parseInt(playerCountString))) throw new Error("Stop trying to break me!")
        if (![16, 48, 72, 4].includes(parseInt(size))) throw new Error("Stop trying to break me!")

        this.id = shortid.generate()
        this.squares = getGameValues(size)
        this.playerCount = parseInt(playerCountString)
        this.lastMove = null;
        this.users = [{ username: user.username, id: user.id, matches: 0, color: randomColor(), upNext: true, active: true }]
        this.status = (this.playerCount !== 1) ? "WAITING" : "ONGOING"
        this.message = (this.playerCount !== 1) ? "Waiting for players!" : "Guess a square!"
        this.round = 0
        this.inProgress = true //get rid of this
        this.gameName = gameName
        this.currentGuesses = []
        this.startTime = new Date();
        this.events = new events.EventEmitter()
        this.moveTimer = countdown({
            seconds: 45,
            onCounterEnd: _ => {
                if (instance) { //double check object exists incase it was deleted
                    instance.NextTurn();
                    instance.events.emit("OUT_OF_TIME", instance.ClientInfo());
                }
            }
        })
        this.timerEnabled = false
    }
    AddUser = user => {
        if (this.users.filter(u => u.active).length >= this.playerCount) throw Error("GAME IS FULL")
        if (!user) throw Error("Invalid User")
        let inGame = this.users.findIndex(u => u.id == user.id)
        console.log(inGame)
        if (inGame != -1) {
            this.users[inGame].active = true;
            this.message = `${user.username} is back!!`
            return;
        }
        this.users.push({ username: user.username, id: user.id, matches: 0, color: randomColor(), upNext: false, active: true })
        if (this.ActiveUsers().length == this.playerCount && this.status != "ONGOING") {
            this.inProgress = true;
            this.status = "ONGOING";
            this.message = `${user.username} just joined! Good luck!`;
            this.ResetMoveTimer(); //function checks whether to start timer or not 
        } else if (!this.inProgress) {
            this.message = `${user.username} just joined! Waiting for more players!`;
        } else {
            this.message = `${user.username} just joined!`;
        }
        this.events.emit("GAME_INFO", this.ClientInfo());
    }

    RemoveUser = id => {
        return new Promise((resolve, reject) => {
            this.users.find(u => u.id == id).active = false
            if (this.ActiveUsers().length == 0) {
                this.status = "DELETE";
                this.inProgress = false;
                resolve(this);
            }
            else {
                if (this.users.find(u => u.id == id).upNext) {
                    this.NextTurn();
                }
                this.events.emit("GAME_INFO", this.ClientInfo());
                resolve(this);
            }
        });
    }
    ResetCards = (nextTurn, message, delay) => {
        this.squares.current = this.squares.defaults.slice();
        this.currentGuesses = [];
        this.resetting = false;
        this.status = "ONGOING";
        this.message = (message) ? message : "Guess a Square!";
        if (nextTurn) this.NextTurn();

        if (delay) setTimeout(() => {
            this.events.emit("GAME_INFO", this.ClientInfo());
        }, RESET_TIMEOUT);
        else this.events.emit("GAME_INFO", this.ClientInfo());
    }

    NextTurn = _ => {
        if (this.ActiveUsers().length > 1 || this.ActiveUsers().findIndex(u => u.upNext) != -1) {
            var next;
            var cur = this.users.findIndex(u => u.upNext);
            const defaultUser = this.users.findIndex(u => u.upNext); //store the default so if loop breaks and it cant find active user do nothing
            var loops = 0;
            do {
                next = (cur + 1 < this.users.length) ? cur + 1 : 0;
                this.users[cur].upNext = false;
                this.users[next].upNext = true;
                cur = (cur + 1 < this.users.length) ? cur++ : 0;
                loops++;
            } while (!this.users.find(u => u.upNext).active && loops < 50) //loop til we find active user or 50 loops
            //if hit max loops go back to default users
            if (loops == 50) {
                this.users[next].upNext = false;
                this.users[defaultUser].upNext = true;
            }
            this.ResetMoveTimer();
        }
        else {
            this.ActiveUsers()[0].upNext = true;
        }
    }
    HandleClick = (userID, guess) => {
        return new Promise(async (resolve, reject) => {
            const userIndex = this.users.findIndex(u => u.id == userID)
            let guessIndex = this.squares.answers.findIndex(a => guess == a.id)
            console.log(`Registering Click: User #${userIndex} is clicking ${guess} #${guessIndex} on this: ${this.id}`, this.currentGuesses)
            //verify they can make a guess
            if (guessIndex == -1) reject("Nooooo!");
            else if (this.currentGuesses.length >= 2) reject("No guesses allowed rn!");
            else if (userIndex == -1) reject("You're not in this this?");
            else if (this.status != "ONGOING") reject("this not in progress!");
            else if (!this.users[userIndex].upNext) reject("Wait your turn plz");
            else if (this.squares.current[guessIndex].value !== "*") reject("You already guessed that brrr");
            else {
                //update new values
                
                this.squares.current[guessIndex] = this.squares.answers[guessIndex];
                this.squares.current[guessIndex].flipped = true;
                this.currentGuesses.push({ index: guessIndex, value: this.squares.answers[guessIndex].value })
                this.message = "Guess Another!"

                //if guess at 2 look for match
                if (this.currentGuesses.length === 2) await this.CheckMatch(userIndex, guessIndex);
                //if just one current guess just send info
                else this.events.emit("GAME_INFO", this.ClientInfo());
                this.lastMove = new Date();

                resolve(this);
            }
        })
    }

    GameOver = async _ => {
        this.status = "GAME_OVER"
        this.resetting = false;
        this.inProgress = false;
        if (this.playerCount > 1) {
            let winner = this.users.sort((a, b) => { return a.matches - b.matches });
            this.message = `Game Over!!!! ${winner[0].username} won with ${winner[0].matches} matches!`;
            this.events.emit("GAME_OVER", { game: this.ClientInfo() });
        }
        ///if one player game save stats 
        else if (this.playerCount == 1) {
            LeaderBoard.AddScore(this.users[0].id, this.round, this.squares.defaults.length, this.startTime)
                .then(leaderboardData => {
                    this.events.emit("GAME_OVER", { game: this.ClientInfo(), leaderboard: { ...leaderboardData, solo: true } });
                })
        }
    }

    CheckMatch = async (userIndex, guessIndex) => {
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
            if (this.squares.defaults.findIndex(s => s.value === "*") === -1) await this.GameOver();
            else {
                this.ResetCards(false, "Nice Match! Guess Again!", false) //reset with no delay
                this.events.emit("GAME_INFO", this.ClientInfo());
            }
        } else { //if no match
            this.message = "Oof! No Match!";
            this.status = "RESETTING";
            this.events.emit("GAME_INFO", this.ClientInfo()); //emit info once
            this.ResetCards(true, "Guess a square!", true) //reset will emit info again after delay
        }
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
            users: this.ActiveUsers().map(u => ({ username: u.username, color: u.color, matches: u.matches, upNext: u.upNext, active: u.active })),
            round: this.round,
            cardsShowing: this.currentGuesses.length,
            message: this.message,
            id: this.id,
            timerEnabled: this.timerEnabled
        })
    }

    ResetMoveTimer = _ => {
        if (this.timerEnabled) {
            this.moveTimer.stop();
            if (this.ActiveUsers().length == 1) this.events.emit("CLEAR_TIMER", { id: this.id }); //only emit clear timer if active users is one
        }
        if (this.ActiveUsers().length > 1) {
            this.timerEnabled = true;
            this.events.emit("START_TIMER", { id: this.id });
            this.moveTimer.start();
        }
    }


    UpNext = _ => this.users.find(u => u.upNext);

    ActiveUsers = _ => this.users.filter(u => u.active);

    ShouldDelete = _ => {

    }
}


module.exports = { Game: Game }
