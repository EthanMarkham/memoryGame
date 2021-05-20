const GameScore = require("../schemas/gameScore.model");
const User = require("../schemas/user.model");
const { diffMinutes } = require('../utils/gameHelpers');

const MonthlyScores = async gameDifficulty => {
    return new Promise((resolve, reject) => {
        const currentDateCondition = {
            "gameDate":
            {
                $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))
            },
            "gameDifficulty": gameDifficulty
        };
        GameScore.find(currentDateCondition, (err, response) => {
            if (err) reject(err);
            else {
                let sorted = response.sort((a, b) => {
                    if (a.score < b.score) return -1;
                    else return 1;
                });
                resolve(sorted)
            }
        });
    })

}
const AllTimeScores = gameDifficulty => {
    return new Promise((resolve, reject) => {
        GameScore.find({ "gameDifficulty": gameDifficulty },
            (err, response) => {
                if (err) reject(err);
                else {
                    let sorted = response.sort((a, b) => {
                        if (a.score < b.score) return -1;
                        else return 1;
                    })
                    resolve(sorted)
                }
            });
    })
}
const AddScore = (userID, round, cardCount, startTime) => {
    return new Promise((resolve, reject) => {
        let now = new Date();
        let gameDifficulty;
        let gameDuration = diffMinutes(now, startTime);

        switch (cardCount) {
            case 16: gameDifficulty = "easy"; break;
            case 48: gameDifficulty = "medium"; break;
            case 72: gameDifficulty = "difficult"; break;
            default: gameDifficulty = "dev"; break;
        }

        let scoreData = new GameScore({ userID: userID, score: round, gameDifficulty: gameDifficulty, gameDuration: gameDuration });
        scoreData.save()
            .then(_ => {
                GetLeaderboardPosition(scoreData)
                    .then(data => resolve(data));
            })
            .catch(e => reject(e));
    })
}
const GetLeaderboardPosition = (scoreData) => {
    return new Promise((resolve, reject) => {
        MonthlyScores(scoreData.gameDifficulty)
            .then(monthlyScores => {
                AllTimeScores(scoreData.gameDifficulty)
                    .then(allTimeScores => {
                        let monthlyPos = monthlyScores.findIndex(a => a._id.toString() == scoreData._id.toString()) + 1
                        let allTimePos = allTimeScores.findIndex(a => a._id.toString() == scoreData._id.toString()) + 1;
                        let allTimeCount = allTimeScores.length;
                        let monthlyCount = monthlyScores.length;
                        let allUserIDs = allTimeScores.slice(0, 99).map(a => a.userID)
                            .concat(monthlyScores.slice(0, 99).map(a => a.userID));
                        //pull needed ids from list just maded
                        User.find({_id: {$in: allUserIDs}}, (err, users) => {
                            if (err) reject(err);
                            monthlyScores = mapToPublicData(monthlyScores.slice(0, 99), users, scoreData._id.toString());
                            allTimeScores = mapToPublicData(allTimeScores.slice(0, 99), users, scoreData._id.toString());
                            resolve({
                                monthlyPos: monthlyPos,
                                allTimePos: allTimePos,
                                allTimeCount: allTimeCount,
                                monthlyCount: monthlyCount,
                                monthly: monthlyScores,
                                allTime: allTimeScores
                            });
                        });
                    });
            }).catch(err => {
                console.log(err);
                reject(err);
            });
    })
}

const mapToPublicData = (scores, users, myScoreID) => {
    return scores.map(s => {
        //need to better validate good data passed in
        let user;
        if (users) user = users.find(u => u._id.toString() == s.userID.toString());
        let output = {
            user: user ? user.username : 'Guest',
            score: s.score,
            gameDuration: s.gameDuration,
        }
        if (s._id.toString() == myScoreID) output = {...output, myScore: true };
        return output;
    });
}

module.exports = {
    GetLeaderboardPosition: GetLeaderboardPosition,
    AddScore: AddScore, MonthlyScores: MonthlyScores,
    AllTimeScores: AllTimeScores
}