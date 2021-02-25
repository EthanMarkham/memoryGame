const fs = require('fs')

function sendJSONresponse(res, status, content) {
    res.status(status)
    res.json(content)
}

module.exports.generateBoard = (req, res) => {
    //both files need to have same name. one in paired/1. other in paired/2
    //shuffle fileNames for random cards each time as we are not going to use all
    let fileNames = fs.readdirSync('./public/cards/paired/1').sort(() => Math.random() - 0.5),
        boardSize = req.params.size

    //make new array based off size -> duplicate all values for pairs with different image paths-> randomize order 
    const _halfArray = boardSize * boardSize / 2
    let shuffledArray = [...Array(_halfArray).keys()].flatMap(i => [{
        value: i,
        image: "http://" + req.headers.host + '/cards/paired/1/' + fileNames[i],
        civ: ucFirst(fileNames[i].split('.')[0]) //Get civ name by looking at file name. 
    }, {
        value: i,
        image: "http://" + req.headers.host + '/cards/paired/2/' + fileNames[i],
        civ: ucFirst(fileNames[i].split('.')[0]) 
    }]).sort(() => Math.random() - 0.5) 

    sendJSONresponse(res, 200, shuffledArray)
}
function ucFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }