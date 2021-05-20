const fs = require('fs');
const shortid = require('shortid');
const ucFirst = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
//Helper functions
module.exports.getGameValues = (size) => {
    var fileNames = fs.readdirSync('./public/cards/paired/1') //,

    let itemsToRemove = ((fileNames.length * 2) - size)  //randomly removing difference because its easier than randomly selecting cards
    for (let i = 0; i < itemsToRemove / 2; i++) {
        let removing = Math.floor(Math.random() * fileNames.length)
        fileNames.splice(removing, 1)
    }
    //make new array based off size -> duplicate all values for pairs with different image paths-> randomize order 
    let answers = [...Array(fileNames.length).keys()].flatMap(i => [{
        value: i,
        image: '/cards/paired/1/' + fileNames[i],
        civ: ucFirst(fileNames[i].split('.')[0]),//Get civ name by looking at file name. 
        id: shortid.generate()
    }, {
        value: i,
        image: '/cards/paired/2/' + fileNames[i],
        civ: ucFirst(fileNames[i].split('.')[0]),
        id: shortid.generate()
    }]).sort(() => Math.random() - 0.5)

    let defaults = Array(answers.length).fill({
        value: "*",
        image: "/cards/back.jpg"
    })
    return { answers: answers, defaults: defaults, current: defaults.slice() }
}
module.exports.randomColor = _ => {
    return '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
}

module.exports.countdown = (options) => {
    var timer,
        instance = this,
        seconds = options.seconds || 10,
        updateStatus = options.onUpdateStatus || function () { },
        counterEnd = options.onCounterEnd || function () { };

    function decrementCounter() {
        updateStatus(seconds);
        if (seconds === 0) {
            counterEnd();
            instance.stop();
        }
        seconds--;
    }

    this.start = function () {
        clearInterval(timer);
        timer = 0;
        seconds = options.seconds;
        timer = setInterval(decrementCounter, 1000);
    };

    this.stop = function () {
        clearInterval(timer);
    };
    return this;
}
module.exports.diffMinutes = (endTime, startTime) => {
    return endTime.getTime() - startTime.getTime();
}
function dhm(ms){
    days = Math.floor(ms / (24*60*60*1000));
    daysms=ms % (24*60*60*1000);
    hours = Math.floor((daysms)/(60*60*1000));
    hoursms=ms % (60*60*1000);
    minutes = Math.floor((hoursms)/(60*1000));
    minutesms=ms % (60*1000);
    sec = Math.floor((minutesms)/(1000));
    output = '';
    if (days > 0) output += (days + "d ");
    if (hours > 0) output += (hours + "h ");
    if (minutes > 0) output += (minutes + "m ");
    if (sec > 0) output += (sec + "m" );
    return output;
}