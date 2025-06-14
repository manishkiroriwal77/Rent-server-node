const mongoose = require('mongoose')


const inappSchema = mongoose.Schema({
    reciept: { type: String },
    transactionId: { type: String },
    coinsPurchased: { type: String },
    user: { type: mongoose.Types.ObjectId, ref: "user" }
}, { timestamps: true })

module.exports = mongoose.model('inapp', inappSchema)