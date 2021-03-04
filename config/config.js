var mongoose = require('mongoose')
const _ = require('lodash');

//set up global variables
// module variables
const config = require('./config.json');

mongoose.connect(config.databaseURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log("Connected to Database")
}).catch((err)=>{
    console.log(err)
})
