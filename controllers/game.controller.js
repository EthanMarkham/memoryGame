const fs = require('fs')
const User = require("../model/user.model");
const shortid = require('shortid');

module.exports.sendGameInfo = (req, res) => {
    let response = {
        squares: req.game.squares.current,
        users: req.game.users,
        playerCount: req.params.playerCount,
        inProgress: req.params.inProgress,
        round: req.game.round,
        cardsShowing: req.game.cardsShowing,
        message: req.game.message
    }
    res.status(200).send(response)
}
module.exports.getGame = (req, res, next) => {
    const user = await User.findById(req.userId)
    let game = games.filter(g=>g.users.map(u=>u.username).indexOf(user.username) !== -1).filter(g=>g.completedAt == null)
    if (!game) {
        return res.status(400).json({
            error: true,
            messages: ["Error! Did not find a game with you activie"]
        });
    } 
    req.game = game
    next()
}
module.exports.joinGame = (req, res, next) => {
    const user = await User.findById(req.userId)
    let gameIndex = games.findIndex(g=>g.id == req.params.gameID)

    if (!gameIndex) sendError(["Game does not exist"])

    if (games[gameIndex].users.length >= games[gameIndx].playerCount) sendError(["Game full!"])

    games[gameIndex].users.push({username: user.username, matches: 0, color: randomColor(), upNext: false})

    if (games[gameIndex].users.length === games[gameIndex].playerCount) {
        games[gameIndex].inProgress = true
        games[gameIndex].message = `${user.username} just joined! Good luck!`
    }
    else {
        games[gameIndex].message = `${user.username} just joined! Waiting for more players!`
    }
    req.game = games[gameIndex]
    next()
}
module.exports.createGame = (req, res, next) => {
    const user = await User.findById(req.userId)
    if (games.filter(g=>g.completedAt == null).map(g=>g.users.map(u=>u.name)).indexOf(user.username) !== -1) next() //if user in game get them out
    let newGame = {
        id: shortid.generate(),
        users: [{username: user.username, matches: 0, color: randomColor(), upNext: true}],
        playerCount: req.params.playerCount,
        inProgress: (playerCount !== 1) ? false: true,
        completedAt: null, //will enter date time for completed at/auto delete
        round: 0,
        currentGuesses: [],
        message: (playerCount !== 1) ? "Waiting for players!":"Guess a square!",
        squares: createGame(),
    }
    games.push(newGame)
    req.game = newGame
    next()
}
module.exports.registerClick = (req, res, next) => {
    const user = await User.findById(req.userId)
    const guess = parseInt(req.params.guess)
    const gameIndex = games.findIndex(g=>g.id == req.game.id)
    const userIndex = games[gameIndex].users.findIndex(u=>u.username == user.username)
    //verify they can make a guess
    if (games[gameIndex].currentGuesses.length >= 2) next() //check once that there are not two guesses here
    else if (!gameIndex || !userIndex) sendError(["Error! Game is gone?!?! Oops!"])
    else if (!games[gameIndex].users.find({username:user.username}).upNext) next()

    games[gameIndex].squares.current[guess] = games[gameIndex].squares.answer[guess] 
    games[gameIndex].currentGuesses.push({index: guess, value: games[gameIndex].squares.answer[guess].value})

    if (games[gameIndex].currentGuesses.length === 2) {
        if (games[gameIndex].currentGuesses[0].value === games[gameIndex].currentGuesses[1].value){
            games[gameIndex].message = "Nice Match!"
            games[gameIndex].squares.defaults = games[gameIndex].squares.current
            games[gameIndex].squares.defaults[games[gameIndex].currentGuesses[0].index]["matchColor"] = games[gameIndex].users[userIndex].color
            games[gameIndex].users[userIndex].matches++
        } else {
            games[gameIndex].message = "Oof! Try Again!"
        }
        let nextUserIndex = (userIndex + 1 < games[gameIndex].users.count) ? userIndex + 1 : 0
        games[gameIndex].users[userIndex].upNext = false
        games[gameIndex].users[nextUserIndex].upNext = true
        games[gameIndex].round++
        
    }
    else next()
}


const createGame = () => {
    let file1Names = fs.readdirSync('./public/cards/paired/1') //,
        file2Names = fs.readdirSync('./public/cards/paired/2')
        _halfBoard = (req.params.size) ? req.params.size / 2: file1Names.length
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

    let defaults = Array(answerSquares.length).fill({
        value: "*",
        image: "/cards/back.PNG"
      })
    return {answers: answers, defaults: defaults, current: defaults}
}

const randomColor = () => {
    "use strict";
  
    const randomInt = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
  
    return () => {
      var h = randomInt(0, 360);
      var s = randomInt(42, 98);
      var l = randomInt(40, 90);
      return `hsl(${h},${s}%,${l}%)`;
    };
}
const sendError = (messages) => {
    return res.status(400).json({
        error: true,
        messages: messages
    });
}
const ucFirst = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}