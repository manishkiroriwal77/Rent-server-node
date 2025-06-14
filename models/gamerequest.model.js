const mongoose = require('mongoose')
const gameRequest = mongoose.Schema({
    from: { type: mongoose.Types.ObjectId, default: null, ref: 'user' },
    to: { type: mongoose.Types.ObjectId, default: null, ref: 'user' },
    isAccepted: { type: Boolean, default: false },
    coins: { type: Number, default: 0 }
}, { timestamps: true })

module.exports = mongoose.model('gameRequest', gameRequest)