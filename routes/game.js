var express = require('express');
var router = express.Router();
var gameController = require('../controllers/game.controller')
var userController = require('../controllers/user.controller')

/* GET reviews */
router.get('/join/:jwtToken', userController.verifyToken, gameController.joinGame, gameController.sendGameInfo) 

router.get('/create/:jwtToken', userController.verifyToken, gameController.createGame, gameController.sendGameInfo) 

router.get('/join/:jwtToken/:gameId', userController.verifyToken, gameController.joinGame, gameController.sendGameInfo) 

router.get('/click/:jwtToken/:guess', userController.verifyToken, gameController.getGame, gameController.registerClick, gameController.sendGameInfo)

module.exports = router;
