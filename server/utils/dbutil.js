var mongoose = require('mongoose')

const _ = require('lodash');

//set up global variables
// module variables
const config = require('../config/config.json');
//connect to users db
mongoose.connect(config.dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log("Connected to DB")
}).catch((err)=>{
    console.log(err)
})