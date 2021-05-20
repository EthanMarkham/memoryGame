var express = require('express');
var router = express.Router();
const validator = require("express-validator");
var userController = require('../controllers/user.controller')

//routes
router.post("/register",
    [
        validator.check("username", "Please Enter a Valid Username")
        .not()
        .isEmpty(),
        validator.check("username", "Username must be between 4 and 12 chars!")
        .isLength({min: 4, max: 12}),
        validator.check("password", "Password  must be between 4 and 12 chars!")
        .isLength({min: 4, max: 12}),
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


router.get("/me/:jwtToken", userController.verifyToken, userController.me)
module.exports = router;