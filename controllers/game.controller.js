const fs = require('fs')

function sendJSONresponse(res, status, content) {
    res.status(status)
    res.json(content)
}

module.exports.generateBoard = (req, res) => {
    //both files need to have same name. one in paired/1. other in paired/2
    //shuffle fileNames for random cards each time as we are not going to use all
    let file1Names = fs.readdirSync('./public/cards/paired/1') //,
        file2Names = fs.readdirSync('./public/cards/paired/2')
        _halfBoard = (req.params.size) ? req.params.size / 2: file1Names.length
    //make new array based off size -> duplicate all values for pairs with different image paths-> randomize order 
    let shuffledArray = [...Array(_halfBoard).keys()].flatMap(i => [{
        value: i,
        image: '/cards/paired/1/' + file1Names[i],
        civ: ucFirst(file1Names[i].split('.')[0]) //Get civ name by looking at file name. 
    }, {
        value: i,
        image: '/cards/paired/2/' + file2Names[i],
        civ: ucFirst(file1Names[i].split('.')[0]) 
    }]).sort(() => Math.random() - 0.5) 

    sendJSONresponse(res, 200, shuffledArray)
}
function ucFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }