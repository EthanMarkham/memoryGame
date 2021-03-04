var mongoose = require('mongoose');
const validator = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user.model");
const config = require('../config/config.json');
var session = require('express-session')

module.exports.signUp = async (req, res) => {
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const {
        username,
        password
    } = req.body;
    try {
        let user = await User.findOne({
            username
        });
        if (user) {
            return res.status(400).json({
                msg: "User Already Exists"
            });
        }

        user = new User({
            username,
            password
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            "randomString", {
                expiresIn: 10000
            },
            (err, token) => {
                if (err) throw err;
                res.status(200).json({
                    token
                });
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
            errors: errors.array()
        });
    }

    const {
        username,
        password
    } = req.body;
    try {
        let user = await User.findOne({username});
        if (!user)
            return res.status(400).json({
                message: "User Not Exist"
            });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({
                message: "Incorrect Password !"
            });

        const payload = {
            user: {
                id: user.id
            }
        };

        var token = jwt.sign(payload, config.secret, { expiresIn: '1h' })
        
        session.token = token
        res.redirect('/users/me');

    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: "Server Error"
        });
    }
}
//logout Middleware
module.exports.logout = async (req, res, next) => {
    delete req.session
    next()
}
//Auth middleware
module.exports.verifyToken = (req, res, next) => {
    let token = session.token;

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