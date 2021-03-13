var express = require('express');
var router = express.Router();
var gameManager = require('../model/gameManager')
var userController = require('../controllers/user.controller')

/* GET reviews */
router.get('/get/:jwtToken', userController.verifyToken, async (req, res) => {
    const user = await User.findById(req.userId);
    let index = gameManager.FindGameIndex(user);
    if (!index) {
        res.status(500).json({error: 'game not found'})
        return
    }
    res.status(200).json({game: gameManager.GetUserData(index)})
})

module.exports = router;
