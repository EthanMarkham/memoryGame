const mongoose = require("mongoose");

const GameScore = mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  score: {
    type: Number,
    required: true
  },
  gameDifficulty: {
    type: String,
    required: true
  },
  gameDuration: {
    type: Number,
    default: 0
  },
  gameDate: {
    type: Date,
    default: Date.now()
  },
});
// export model user with UserSchema
module.exports = mongoose.model("gameScore", GameScore);