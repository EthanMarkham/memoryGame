var express = require('express');
var router = express.Router();
var gameBoard = require('../controllers/gameBoard')

/* GET reviews */
router.get('/gameBoard/:size', gameBoard.generateBoard) 

router.get('/gameBoard', gameBoard.generateBoard) 

module.exports = router;
