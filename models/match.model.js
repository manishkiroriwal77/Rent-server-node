const mongoose = require('mongoose');
const { boolean } = require('yup');
const matchSchema = mongoose.Schema({
    players: [
        {
            type: mongoose.Types.ObjectId, default: [], ref: 'user'
        }
    ],
    winner: { type: mongoose.Types.ObjectId, default: null, ref: 'user' },
    tournament: { type: mongoose.Types.ObjectId, ref: 'tournament', default: null },
    roomId: { type: mongoose.Types.ObjectId, ref: 'gameRequest', default: null },
    deck: [
        {
            name: { type: String, default: null },
            points: { type: Number, default: null },
            suit: { type: String, default: null },
            value: { type: String, default: null },
            cardvalue: { type: Number, default: null }
        }
    ],
    player1: {
        playerId: { type: mongoose.Types.ObjectId, default: null, ref: 'user' },
        cards: [
            {
                name: { type: String, default: null },
                points: { type: Number, default: null },
                suit: { type: String, default: null },
                value: { type: String, default: null },
                cardvalue: { type: Number, default: null }
            }
        ],
        cardPlayed: {
            name: { type: String, default: null },
            points: { type: Number, default: null },
            suit: { type: String, default: null },
            value: { type: String, default: null },
            cardvalue: { type: Number, default: null }
        },
        points: { type: Number, default: 0 }
    },
    player2: {
        playerId: { type: mongoose.Types.ObjectId, default: null, ref: 'user' },
        cards: [
            {
                name: { type: String, default: null },
                points: { type: Number, default: null },
                suit: { type: String, default: null },
                value: { type: String, default: null },
                cardvalue: { type: Number, default: null }
            }
        ],
        cardPlayed: {
            name: { type: String, default: null },
            points: { type: Number, default: null },
            suit: { type: String, default: null },
            value: { type: String, default: null },
            cardvalue: { type: Number, default: null }
        },
        points: { type: Number, default: 0 }
    },
    startTime: { type: Date, default: null },
    endTime: { type: Date, default: null },
    bidRound: { type: Boolean, default: true },
    gameDraw: { type: Boolean, default: false },
    turn: { type: mongoose.Types.ObjectId || null, default: null, ref: 'user' },
    dominantSuite: { type: String, default: null },
    bidPlayers: [{ type: mongoose.Types.ObjectId, default: [], ref: 'user' }],
    round: { type: Number, default: 0 },
    turns: [{ type: mongoose.Types.ObjectId, default: [], ref: 'user' }],
    friendsMode: { type: Boolean, default: false },
    coins: { type: Number, default: 0 },
    timerStartTime: { type: Date, default: null },
    endBySelfExit: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('match', matchSchema)