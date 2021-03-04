var express = require('express');
var router = express.Router();
const validator = require("express-validator");
var userController = require('../controllers/user.controller')
const User = require("../model/user.model");

//routes
router.get('/register', (req, res) => {
    res.render('login', {action: "register"})
})
router.get('/login', (req, res) => {
    res.render('login', {action: "login"})
})
router.post("/register",
    [
        validator.check("username", "Please Enter a Valid Username")
        .not()
        .isEmpty(),
        validator.check("password", "Please enter a valid password").isLength({
            min: 4
        })
    ], userController.signUp)
    
router.post(
  "/login",
  [
    validator.check("username", "Please enter a valid email").not()
    .isEmpty(),
    validator.check("password", "Please enter a valid password").isLength({
      min: 4
    })
  ], userController.login)

router.get('/logout', userController.logout, (req, res) => res.redirect('/users/login'))

router.get("/me", userController.verifyToken, async (req, res) => {
    console.log(req.userId)
    try {
        // request.user is getting fetched from Middleware after token authentication
        const user = await User.findById(req.userId);
        console.log(user)
        res.json(user);
    } catch (e) {
        res.send({ message: "Error in Fetching user" });
    }
    });
module.exports = router;