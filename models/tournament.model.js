const mongoose = require('mongoose')

const tournamentSchema = mongoose.Schema({
    matches: [{ type: mongoose.Types.ObjectId, ref: "matches" }],
    name: { type: String },
    dateTime: { type: Date },
    isStart: { type: Boolean, default: false },
    isEnd: { type: Boolean, default: false },
    totalPlayers: { type: Number },
    registerCoins: { type: Number },
    winningAmount: { type: Number },
    players: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    joinedPlayers: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    exitPlayers: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    isBlock: { type: Boolean, default: false },
    destoryAfter2Mins: { type: Boolean, default: false },
    winner: { type: mongoose.Types.ObjectId, ref: "user", default: null }
}, { timestamps: true })

module.exports = mongoose.model('tournament', tournamentSchema)