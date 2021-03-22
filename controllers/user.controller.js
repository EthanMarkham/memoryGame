const validator = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user.model");
const config = require('../config/config.json');

module.exports.signUp = async (req, res) => {
    const errors = validator.validationResult(req);
    const salt = await bcrypt.genSalt(10)
    const {username,password} = req.body;

    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: true,
            messages: errors.errors.map(e=>e.msg)
        });
    }
    try {
        let user = await User.findOne({username})
        if (user) {
            return res.status(400).json({
                error: true,
                messages: ["User Already Exists"]
            });
        }

        user = new User({username,password})
        user.password = await bcrypt.hash(password, salt)
        await user.save()

        const payload = {user: {id: user.id}}

        jwt.sign(payload, config.secret, { expiresIn: '2 days' },
            (err, token) => {
                if (err) throw err;
                res.redirect(`/api/users/me/${token}`);
            }
        );
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}

module.exports.login = async (req, res) => {
    const errors = validator.validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: true,
            messages: errors.errors.map(e=>e.msg)
        })
    }

    const {username,password} = req.body;
    try {
        let user = await User.findOne({username})
        if (!user)
            return res.status(400).json({
                error: true,
                messages: ["User Does Not Exist!!"]
            });

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch)
            return res.status(400).json({
                error: true,
                messages: ["Incorrect Password!"]
            })

        const payload = {user: {id: user.id}}

        var token = jwt.sign(payload, config.secret, { expiresIn: '2 days' })
        
        res.redirect(`/api/users/me/${token}`)
    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: "Server Error"
        });
    }
}
module.exports.me = async (req, res) => {
    try {
        // request.user is getting fetched from Middleware after token authentication
        const user = await User.findById(req.userId);
        res.json({username: user.username, token: req.params.jwtToken});
    } catch (e) {
        res.status(200).send({ message: "Error in Fetching user" });
    }
}
//Auth middleware
module.exports.verifyToken = (req, res, next) => {
    let token = req.params.jwtToken
    if (!token) {
        return res.status(403).send({
            auth: false, message: 'No token provided.'
        });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(500).send({
                auth: false,
                message: 'Fail to Authentication. Error -> ' + err
            });
        }
        req.userId = decoded.user.id;
        next();
    });
}