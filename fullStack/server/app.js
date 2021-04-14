require('dotenv').config(); // Allows use of environmental variables from the .env file
const express = require('express'); // Fast web framework for node js
const cors = require('cors')
var mongoose = require('mongoose')
const _ = require('lodash');

// Getting main api file and loading custom middlewares
const middlewares = require('./middlewares.js');
const api = require('./api');
const adminRoutes = require('./api/admin'); 
const userRoutes = require('./api/user'); 

// Setting up express & must use middleware
let app = express();
app.set('trust proxy', 1); // When using something like nginx or apache as a proxy
app.use(express.json()); // Allows use of req.body (for json)

//session
var session = require("express-session")({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
  })
const sharedsession = require("express-socket.io-session");

//db setup
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(()=>console.log("Connected to Database"))
.catch((err)=>console.log(err));


//Sends json so that it looks good
app.set('json spaces', 2);

app.use(cors());
app.use(session);

// Custom Middleware
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);
app.use('/public', express.static(__dirname+'/../public'));
app.use('/api', api);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Setting up node js server
let port = process.env.PORT || 3003;
let server = app.listen(port, () => console.log(`Server running on port ${port}...`));

 //socket stuff
 const io = require("socket.io")(server, {
   cors: {
     origin: "*",
     methods: ["GET", "POST"],
     credentials: true
   }
 })
 io.use(sharedsession(session));
 require('./modules/socket')(io)

// Basic Routing
app.get('/robots.txt', (req, res) => res.sendFile('robots.txt', {root: __dirname}));
app.get('*', (req, res) => res.sendFile('index.html', {root: __dirname+'/../public'}));

module.exports = {session: session };
