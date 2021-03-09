var express = require('express');
var router = express.Router();
var gameBoard = require('../controllers/game.controller')

/* GET reviews */
router.get('/create/:size', gameBoard.generateBoard) 

router.get('/create', gameBoard.generateBoard) 

module.exports = router;
