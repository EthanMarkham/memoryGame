const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user.model");
const config = require('../config/config.json');
const GameController = require("./game.controller")

module.exports.removeUser = (req, res) => {
    let { userID } = req.params
    GameController.RemoveUser(userID)
        .then(data => res.send({ userID: userID, deleted: data.deleted, gameID: data.id }))
        .catch(err => res.send({ error: true, message: err.message }))
}
module.exports.skipUser = (req, res) => {
    let { userID } = req.params
    GameController.SkipUser(userID)
        .then(users => res.send({ skipped: true, users: users }))
        .catch(err => res.send({ error: true, message: err.message }))
}
module.exports.getGames = (req, res) => {
    try { res.send({ games: GameController.GetAllGames() }) }
    catch { res.send({ error: true, message: "Couldnt get games?" }) }
}
module.exports.getUsers = (req, res) => {
    User.find({}, (users) => {
        res({ users: users })
    })
        .catch(err => res({ error: true, message: "Couldn't load users" }))
}
module.exports.deleteGame = (req, res) => {
    const {deleted} = GameController.DeleteGame(req.params.gameID)
    res.send({ deleted: deleted, games: GameController.GetAllGames() })
}

module.exports.adminLogin = async (req, res) => {
    const { username, password } = req.body;
    console.log(username, password)
    try {
        let user = await User.findOne({ username })
        if (!user)
            return res.status(400).json({
                error: true,
                message: "user not found!"
            })
        let isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch)
            return res.status(400).json({
                error: true,
                message: "Incorrect Password!"
            })
        if (user.permission != "ADMIN" && user.permission != "MODERATOR") {
            return res.status(400).json({
                error: true,
                message: "Insufficient Permissions"
            })
        }
        const payload = { user: { id: user.id, permission: user.permission } }
        var token = jwt.sign(payload, config.secret, { expiresIn: '1 days' })
        res.redirect(`/api/admin/me/${token}`)
    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: "Server Error"
        });
    }
}
//Auth middleware
module.exports.verifyAdminToken = (req, res, next) => {
    let token = req.params.jwtToken
    if (!token) {
        return res.send({
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
        if (decoded.user.permission != "ADMIN" && decoded.user.permission != "MODERATOR") { //here maybe pull user info on each attempt rather than store permission in jwt?
            res.send({ error: true, message: "Insufficient Authentication" })
            return
        }
        req.userId = decoded.user.id;
        req.permission = decoded.user.permission;
        next();
    });
}
module.exports.me = async (req, res) => {
    try {
        // request.user is getting fetched from Middleware after token authentication
        const user = await User.findById(req.userId);
        res.json({ username: user.username, permission: user.permission, token: req.params.jwtToken });
    } catch (e) {
        res.status(200).send({ error: true, message: "Error in Fetching user" });
    }
}