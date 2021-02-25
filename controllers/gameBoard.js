const fs = require('fs')

function sendJSONresponse(res, status, content) {
    res.status(status)
    res.json(content)
}

module.exports.generateBoard = (req, res) => {
    let pair1dir = './public/cards/paired/1',
        pair2dir = './public/cards/paired/2',
        pair1files = fs.readdirSync(pair1dir),
        pair2files = fs.readdirSync(pair2dir)

    let shuffledArray = [...Array(pair1files.length).keys()].flatMap(i => [{
        value: i,
        image: "http://" + req.headers.host + '/cards/paired/1/' + pair1files[i]
    }, {
        value: i,
        image: "http://" + req.headers.host + '/cards/paired/2/' + pair2files[i]
    }]).sort(() => Math.random() - 0.5) //make new array based off size -> duplicate all values for pairs -> randomize order

    sendJSONresponse(res, 200, shuffledArray)

}