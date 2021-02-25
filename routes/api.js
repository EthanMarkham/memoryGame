var express = require('express');
var router = express.Router();
var gameBoard = require('../controllers/gameBoard')

/* GET reviews */
router.get('/gameBoard/:size', gameBoard.generateBoard) 


module.exports = router;
