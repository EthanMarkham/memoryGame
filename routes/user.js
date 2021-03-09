var express = require('express');
var router = express.Router();
const validator = require("express-validator");
var userController = require('../controllers/user.controller')
const User = require("../model/user.model");

//routes
router.post("/register",
    [
        validator.check("username", "Please Enter a Valid Username")
        .not()
        .isEmpty(),
        validator.check("username", "Username Must be at least 4 chars!")
        .isLength({min: 4}),
        validator.check("password", "Password must be at least 4 chars!")
        .isLength({min: 4})
    ], userController.signUp)
    
router.post(
  "/login",
  [
    validator.check("username", "Please enter a valid username").not()
    .isEmpty(),
    validator.check("password", "Enter your password!").not()
    .isEmpty()
  ], userController.login
)


router.get("/me/:jwtToken", userController.verifyToken, async (req, res) => {
    console.log(req.userId)
    try {
        // request.user is getting fetched from Middleware after token authentication
        const user = await User.findById(req.userId);
        console.log(user)
        res.json({username: user.username, token: req.params.jwtToken});
    } catch (e) {
        res.status(200).send({ message: "Error in Fetching user" });
    }
});
module.exports = router;