var express = require('express');
const app = require('../app');
var router = express.Router();
//var ReactDomServer = require('react-dom/server')
//const React = require('react')
app.get("/", (req, res) => {
    //const component = ReactDomServer.renderToString(<Game />);
    //res.send(component);
})
module.exports = router;
