var express = require('express');
var router = express.Router();
var adminController = require('../controllers/admin.controller')

//routes
router.post("/login", adminController.adminLogin)

router.get("/me/:jwtToken", adminController.verifyAdminToken, adminController.me)

router.get("/deleteGame/:jwtToken/:gameID", adminController.verifyAdminToken, adminController.deleteGame)

router.get("/removeUser/:jwtToken/:userID/", adminController.verifyAdminToken, adminController.removeUser)

router.get("/getGames/:jwtToken", adminController.verifyAdminToken, adminController.getGames)

module.exports = router;